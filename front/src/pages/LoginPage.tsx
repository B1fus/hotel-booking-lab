import React, { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../api';


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tokenResponse = await api.loginAdmin(username, password);
      await login(tokenResponse.access_token); 
      navigate('/admin'); 
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
       return <div className="container mt-5 text-center"><LoadingSpinner /></div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Вход (админка)</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Имя</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Пароль</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <ErrorMessage message={error} />

                {isLoading ? (
                  <div className="text-center">
                      <LoadingSpinner />
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                    Войти
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;