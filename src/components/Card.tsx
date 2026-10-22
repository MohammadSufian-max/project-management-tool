import image from '../assets/image.jpg';

interface CardProps {
  title: string;
  desc: string;
}

const Card = (props: CardProps) => {
  return (
    <div className="border-4">
      <img src={image} alt="My image" width={200} />
      <h2>{props.title}</h2>
      <p>{props.desc}</p>
    </div>
  );
};

export default Card;