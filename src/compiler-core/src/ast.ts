export const RegRulers = {
  contentReg: /^{{\s*(\w+)\s*}}/,
  tagReg: /^<\/?([a-z]*)>/i,
  textReg: /^([\s\S]*)$/,
};
export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
}
