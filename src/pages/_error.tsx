import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{statusCode ? `Error ${statusCode}` : 'Application error'}</h1>
      <p>Something went wrong</p>
      <a href="/">Go home</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
