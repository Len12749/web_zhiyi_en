--[[
图片处理Lua过滤器
用于在Pandoc转换过程中修改图片的处理方式
主要功能：
1. 移除自动生成的图片标题
2. 调整图片大小和对齐方式
--]]

-- 处理图片元素，简化版本
function Image(elem)
    -- 为图片添加属性
    if elem.attributes == nil then
        elem.attributes = {}
    end
    
    -- 移除标题相关属性
    elem.attributes["unlabeled"] = ""
    elem.attributes["unnumbered"] = ""
    elem.attributes["width"] = "50%"  -- 设置图片宽度为50%
    elem.attributes["style"] = "margin: auto; display: block; text-align: center;"
    
    -- 清空caption和identifier
    elem.caption = {}
    elem.identifier = ""
    
    -- 我们不直接创建LaTeX代码块，而是让Pandoc处理图片插入
    -- 只需设置正确的属性即可
    
    return elem
end

-- 对文档元数据进行处理
function Header(el)
    -- 这个函数只是为了保持过滤器的完整性
    -- 实际上我们不需要修改标题
    return el
end

-- 返回过滤器函数列表
return {
    Image = Image,
    Header = Header
} 