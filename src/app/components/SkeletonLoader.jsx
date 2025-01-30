const SkeletonLoader = ({ count = 6 }) => {
  return (
    <section className='skeleton-wrapper'>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton-container ${index % 2 !== 0 ? 'right' : ''}`}
        >
          <div className='skeleton skeleton-image'></div>
          <div className='skeleton-content'>
            <div className='skeleton skeleton-text skeleton-text-medium'></div>
            <div className='skeleton skeleton-text skeleton-text-medium'></div>
            <div className='skeleton skeleton-text skeleton-text-medium'></div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default SkeletonLoader;
