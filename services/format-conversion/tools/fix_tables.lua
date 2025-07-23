--[[
修复表格的Lua过滤器
用于在Pandoc转换期间处理和美化表格
主要功能：
1. 添加表格边框
2. 处理特殊符号和上标
3. 确保表格样式一致
--]]

-- 存储原始表格函数的备份
local original_table = pandoc.Table

function pandoc.Table(caption, aligns, widths, headers, rows, attr)
    -- 调用原始表格函数创建表格
    local tbl = original_table(caption, aligns, widths, headers, rows, attr)
    
    -- 确保表格有attr属性
    if not tbl.attr then
        tbl.attr = pandoc.Attr('', {'table'}, {})
    end
    
    -- 如果表格没有指定类，添加默认类
    if not tbl.attr.classes then
        tbl.attr.classes = {'table'}
    end
    
    -- 添加表格样式属性
    if not tbl.attr.attributes then
        tbl.attr.attributes = {}
    end
    
    -- 添加表格边框和其他样式属性
    tbl.attr.attributes['border'] = '1'
    tbl.attr.attributes['cellpadding'] = '8'
    tbl.attr.attributes['cellspacing'] = '0'
    tbl.attr.attributes['style'] = 'border-collapse: collapse; width: 100%;'
    
    -- 添加表格居中的属性
    table.insert(tbl.attr.classes, 'table-center')
    
    return tbl
end

-- 处理表格单元格中的特殊符号
function process_special_symbols(elem)
    -- 处理上标和下标
    if elem.tag == 'Str' then
        -- 处理上标形式: L^-1
        elem.text = string.gsub(elem.text, "L%^%-1", "L<sup>-1</sup>")
        
        -- 处理微克单位: µg
        elem.text = string.gsub(elem.text, "µg", "µg")
        
        -- 处理复合单位: µg·L^-1
        elem.text = string.gsub(elem.text, "µg·L%^%-1", "µg·L<sup>-1</sup>")
    end
    return elem
end

-- 遍历文档中的表格单元格，处理特殊符号
function process_tables(elem)
    -- 如果是表格，递归处理表格中的每个单元格
    if elem.tag == 'Table' then
        -- 处理表头
        if elem.headers then
            for i, header in ipairs(elem.headers) do
                -- 直接使用字符串替换而不是walk_block，避免版本兼容性问题
                if type(header) == 'table' and header.text then
                    header.text = string.gsub(header.text, "L%^%-1", "L<sup>-1</sup>")
                    header.text = string.gsub(header.text, "µg", "µg")
                    header.text = string.gsub(header.text, "µg·L%^%-1", "µg·L<sup>-1</sup>")
                end
            end
        end
        
        -- 处理表格行
        if elem.rows then
            for i, row in ipairs(elem.rows) do
                for j, cell in ipairs(row) do
                    -- 直接使用字符串替换而不是walk_block，避免版本兼容性问题
                    if type(cell) == 'table' and cell.text then
                        cell.text = string.gsub(cell.text, "L%^%-1", "L<sup>-1</sup>")
                        cell.text = string.gsub(cell.text, "µg", "µg")
                        cell.text = string.gsub(cell.text, "µg·L%^%-1", "µg·L<sup>-1</sup>")
                    end
                end
            end
        end
    end
    return elem
end

-- Pandoc过滤器定义
return {
    {Table = process_tables},
    {Str = process_special_symbols}
} 