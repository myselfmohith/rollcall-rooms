import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ component, user }) {
    if (user) return component;
    else return <Navigate to="/authentication" />;
}