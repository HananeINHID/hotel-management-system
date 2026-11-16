import HomeNavbar from './components/HomeNavbar'
import HeroSection from './components/HeroSection'
import AboutRiad from './components/AboutRiad'
import RoomsSection from './components/RoomsSection'
import ServicesSection from './components/ServicesSection'
import GallerySection from './components/GallerySection'
import LocationSection from './components/LocationSection'
import HomeFooter from './components/HomeFooter'

function HomePage() {
  return (
    <div className="font-sans bg-creme overflow-x-hidden">
      <HomeNavbar />
      <HeroSection />
      <AboutRiad />
      <RoomsSection />
      <ServicesSection />
      <GallerySection />
      <LocationSection />
      <HomeFooter />
    </div>
  )
}

export default HomePage
