import './RestaurantBrand.css'

export default function RestaurantBrand() {
  return (
    <span className="restaurant-brand">
      <svg className="restaurant-brand-mark" width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="m6 11 7 5L20 6l7 10 7-5-4 16H10L6 11Z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 27h20M8 33c4-4 8 4 12 0s8 4 12 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="6" cy="10" r="1.5" fill="currentColor" />
        <circle cx="20" cy="5" r="1.5" fill="currentColor" />
        <circle cx="34" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <span className="restaurant-brand-name">The Sea's Crown</span>
    </span>
  )
}
