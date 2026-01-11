import { usePageContext } from 'vike-react/usePageContext';

export function Head() {
  const pageContext = usePageContext();
  const is404 = pageContext.is404;

  const title = is404 ? 'Page Not Found | OK to Eat' : 'Error | OK to Eat';

  return (
    <>
      <title>{title}</title>
      <meta name="robots" content="noindex" />
    </>
  );
}
