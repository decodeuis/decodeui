export const resizeHandleStyles = `return \`._id {
  width: 100%;
  height: 8px;
  cursor: ns-resize;
  position: absolute;
  bottom: -4px;
  left: 0;
  z-index: 100;
  user-select: none;
  
  &::before {
    content: "";
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: \${args.theme.var.color.border};
    transition: all 0.2s ease;
    opacity: 0.5;
  }
  
  &:hover::before {
    height: 2px;
    background-color: \${args.theme.var.color.primary};
    opacity: 1;
  }
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background-color: \${args.theme.var.color.border};
    border-radius: 2px;
    transition: all 0.2s ease;
    opacity: 0;
  }
  
  &:hover::after {
    background-color: \${args.theme.var.color.primary};
    height: 4px;
    opacity: 1;
  }
}\`;`;

export const resizeContainerStyles = `return \`._id {
  position: relative;
  padding-bottom: 4px;
}\`;`;
