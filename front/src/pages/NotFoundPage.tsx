import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mt-5 text-center">
      <h2>404 - Page Not Found</h2>
      <p>Страница не найдена :(</p>
      <Link to="/" className="btn btn-primary">Вернуться</Link>
    </div>
  );
};

export default NotFoundPage;