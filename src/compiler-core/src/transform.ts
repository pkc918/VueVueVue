import { NodeTypes } from "./ast";

export function transform(root, options) {
  const context = createTransformContext(root, options);
  /* 
    深度优先遍历
  */
  traverseNode(root, context);
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}

function traverseNode(node: any, context) {
  // if (node.type === NodeTypes.TEXT) {
  //   node.content = node.content + "mini-vue";
  //   console.log(node.content);
  // }
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}
