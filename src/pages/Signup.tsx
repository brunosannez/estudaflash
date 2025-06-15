
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the complete signup form
    navigate('/new-signup', { replace: true });
  }, [navigate]);

  return null;
};

export default Signup;
