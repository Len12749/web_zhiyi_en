--[[
表格处理Lua过滤器
用于在Pandoc转换过程中为表格添加特殊处理
主要功能：
1. 根据输出格式应用不同的表格样式
2. 为LaTeX输出添加必要的包和环境
3. 自动处理宽表格的横向显示
--]]

-- 获取当前的输出格式
local format = ""

-- 在文档开始时添加必要的LaTeX包和设置输出格式
function Meta(meta)
    -- 检查输出格式
    if FORMAT:match("latex") or FORMAT:match("pdf") then
        format = "latex"
    elseif FORMAT:match("docx") or FORMAT:match("odt") then
        format = "docx"
    elseif FORMAT:match("html") then
        format = "html"
    else
        format = "other"
    end
    
    -- 如果是LaTeX格式，添加必要的包
    if format == "latex" then
        -- 添加必要的LaTeX包
        meta.header_includes = meta.header_includes or pandoc.MetaList{}
        
        table.insert(meta.header_includes, pandoc.MetaBlocks{
            pandoc.RawBlock("latex", [[
\usepackage{pdflscape}
\usepackage{booktabs}
\usepackage{array}
\usepackage{colortbl}
\usepackage{amsmath}
\usepackage{xeCJK}
\usepackage{unicode-math}
\usepackage{fontspec}

% 设置表格样式
\renewcommand{\arraystretch}{1.2}
\arrayrulecolor{black}
\setlength\arrayrulewidth{1pt}
]])
        })
    end
    
    return meta
end

-- 处理表格
function Table(el)
    -- 检查表格是否需要横向显示
    local needs_landscape = false
    
    -- 如果表格有4列或更多，使用横向显示
    if el.colspecs and #el.colspecs >= 4 then
        needs_landscape = true
    end
    
    -- 设置表格属性
    el.attributes = el.attributes or {}
    
    -- 根据输出格式设置不同的表格属性
    if format == "html" then
        -- HTML表格属性
        el.attributes["border"] = "1"
        el.attributes["cellpadding"] = "8"
        el.attributes["cellspacing"] = "0"
        el.attributes["style"] = "border-collapse: collapse; width: 100%;"
    elseif format == "docx" then
        -- Word表格属性
        el.attributes["border"] = "1"
        el.attributes["cellpadding"] = "5"
        el.attributes["cellspacing"] = "0"
        -- 添加特殊属性以确保表格边框显示
        el.attributes["style"] = "border: 1px solid black; border-collapse: collapse;"
    elseif format == "latex" then
        -- LaTeX表格属性
        el.attributes["border"] = "1"
        el.attributes["cellpadding"] = "5"
        el.attributes["cellspacing"] = "0"
        -- 添加表格宽度限制，设置为页面宽度的85%
        el.attributes["style"] = "border-collapse: collapse; width: 85%;"
    end
    
    -- 设置表格列对齐方式为居中
    if el.colspecs then
        for i = 1, #el.colspecs do
            el.colspecs[i].alignment = "center"
        end
    end
    
    -- 根据输出格式处理表格
    if format == "latex" and needs_landscape then
        -- 对于LaTeX格式，如果需要横向显示，将表格包装在横向环境中
        return {
            pandoc.RawBlock("latex", "\\begin{landscape}"),
            pandoc.RawBlock("latex", "\\begin{table}[H]\\centering\\resizebox{0.85\\textwidth}{!}{"),
            el,
            pandoc.RawBlock("latex", "}\\end{table}"),
            pandoc.RawBlock("latex", "\\end{landscape}")
        }
    elseif format == "latex" then
        -- 对于LaTeX格式但不需要横向显示的表格，包装在调整大小的环境中
        return {
            pandoc.RawBlock("latex", "\\begin{table}[H]\\centering\\resizebox{0.85\\textwidth}{!}{"),
            el,
            pandoc.RawBlock("latex", "}\\end{table}")
        }
    else
        -- 对于其他格式，直接返回表格
        return el
    end
end

-- 返回一个过滤器列表
return {
    { Meta = Meta },
    { Table = Table }
} 