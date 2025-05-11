import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="alert alert-danger my-3" role="alert">
      {message}
    </div>
  );
};

export default ErrorMessage;