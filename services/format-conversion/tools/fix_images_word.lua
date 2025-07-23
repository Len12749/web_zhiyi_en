--[[
图片处理Lua过滤器 (Word文档专用)
用于在Pandoc转换过程中修改图片的处理方式，专为Word文档格式设计
主要功能：
1. 调整图片大小为50%宽度
2. 移除自动生成的图片标题
--]]

-- 处理图片元素
function Image(elem)
    -- 为图片添加属性
    if elem.attributes == nil then
        elem.attributes = {}
    end
    
    -- 设置图片宽度为50%
    elem.attributes["width"] = "50%"
    
    -- 移除标题相关属性
    elem.attributes["unlabeled"] = ""
    elem.attributes["unnumbered"] = ""
    
    -- 清空caption和identifier
    elem.caption = {}
    elem.identifier = ""
    
    return elem
end

-- 返回过滤器函数列表
return {
    Image = Image
} 