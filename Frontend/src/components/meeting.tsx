import { format } from 'date-fns';

interface MeetingProps {
  title: string;
  date: Date;
  participants: string[];
}

const Meeting: React.FC<MeetingProps> = ({ title, date, participants }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-600">{format(date, "dd/MM/yyyy HH:mm")}</p>
      <ul className="mt-2 text-gray-700">
        {participants.map((participant, index) => (
          <li key={index}>• {participant}</li>
        ))}
      </ul>
    </div>
  );
};

export default Meeting;