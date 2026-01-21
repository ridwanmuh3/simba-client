type ErrorPageProps = {
  code: number;
  message: string;
};

const ErrorPage = ({ code, message }: ErrorPageProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{code}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{message}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default ErrorPage;
