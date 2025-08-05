import MediaRoom from './MediaRoom';
import { MediaData } from '../Data/MediaData';
import "../css/MediaRoom.css";

const Support = () => {
  const SlicedSupportData = MediaData.slice(7);
  return (
    <section>
      <MediaRoom  cardsToShow={SlicedSupportData} />
    </section>
  );
};

export default Support;
