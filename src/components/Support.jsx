import MediaRoom from './MediaRoom';
import "../css/MediaRoom.css";

const Support = () => {
  const mediaCategory = MediaData.filter(item => item.category === "media");

  const SlicedSupportData = mediaCategory.slice(7);

  return (
    <section>
      <MediaRoom cardsToShow={SlicedSupportData} />
    </section>
  );
};

export default Support;
