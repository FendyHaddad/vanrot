export interface PortalMountOptions {
  target?: Element;
  document?: Document;
}

export function mountPortal(node: Node, options: PortalMountOptions = {}): () => void {
  const ownerDocument = options.document ?? globalThis.document;
  const target = options.target ?? ownerDocument?.body;

  if (target === undefined || target === null) {
    return () => {};
  }

  target.appendChild(node);

  return () => {
    if (node.parentNode === target) {
      target.removeChild(node);
    }
  };
}
