export function lockPageScroll() {
  if (typeof window === 'undefined') return () => {};

  const scrollY = window.scrollY;
  const body = document.body;
  const html = document.documentElement;

  const previous = {
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    htmlScrollBehavior: html.style.scrollBehavior,
  };

  html.style.scrollBehavior = 'auto';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';

  return () => {
    body.style.overflow = previous.bodyOverflow;
    body.style.position = previous.bodyPosition;
    body.style.top = previous.bodyTop;
    body.style.left = previous.bodyLeft;
    body.style.right = previous.bodyRight;
    body.style.width = previous.bodyWidth;

    window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      html.style.scrollBehavior = previous.htmlScrollBehavior;
    });
  };
}
