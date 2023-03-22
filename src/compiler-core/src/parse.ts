import { NodeTypes, RegRulers } from "./ast";

const enum TagType {
  START,
  END,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any = [];
  let node;
  // if (context.source.startsWith("{{")) {
  //   node = parseInterpolation(context);
  // }
  console.log("source: ", context.source);

  if (RegRulers.contentReg.test(context.source)) {
    node = parseInterpolation(context);
  } else if (RegRulers.tagReg.test(context.source)) {
    console.log("parse element");
    node = parseElement(context);
  } else if (!node) {
    node = parseText(context);
  }
  nodes.push(node);
  return nodes;
}

function parseText(context: any) {
  // const match: any = RegRulers.textReg.exec(context.source);
  // const content = match[1];
  // advanceBy(context, match[0].length);
  const text = parseTextData(context, RegRulers.textReg);
  return {
    type: NodeTypes.TEXT,
    tag: text,
  };
}

function parseInterpolation(context) {
  // const openDelimiter = "{{";
  // const closeDelimiter = "}}";

  // const closeIndex = context.source.indexOf(
  //   closeDelimiter,
  //   openDelimiter.length
  // );
  // advanceBy(context, openDelimiter.length);

  // const rawContentLength = closeIndex - openDelimiter.length;

  // const rawContent = context.source.slice(0, rawContentLength);
  // const content = rawContent.trim();
  // console.log("content", content);
  // advanceBy(context, rawContentLength + closeDelimiter.length);
  // console.log("context.source", context.source);

  // let match = RegRulers.contentReg.exec(context.source) as any;
  // let content = match[1];
  // console.log("content", match);
  // advanceBy(context, match[0].length);

  const content = parseTextData(context, RegRulers.contentReg);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}

function advanceBy(context: any, length: number) {
  // context.source = "";
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
  };
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}
function parseElement(context: any) {
  const element = parseTag(context, TagType.START);
  parseTag(context, TagType.END);
  console.log("____", context.source);

  return element;
}

function parseTag(context: any, type: TagType) {
  // const match: any = RegRulers.tagReg.exec(context.source);
  // console.log("match", match);
  // const tag = match[1];

  // advanceBy(context, match[0].length);
  const tag = parseTextData(context, RegRulers.tagReg);
  console.log("source: ", context.source);
  if (type === TagType.END) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
}

function parseTextData(context: any, regRuler: RegExp, length?: number) {
  const match: any = regRuler.exec(context.source);
  advanceBy(context, match[0].length);
  return match[1];
}
