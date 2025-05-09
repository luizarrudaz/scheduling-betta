import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export default function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <button 
      onClick={handleLogout}
      className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-500 transition-colors"
      title="Sair"
    >
      <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-5 h-5" />
      <span className="sr-only">Sair</span>
    </button>
  );
}