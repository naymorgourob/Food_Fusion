import { MotionConfig } from 'framer-motion'
import { HeroSection } from '@/pages/landing/sections/HeroSection'
import { ServicesSection } from '@/pages/landing/sections/ServicesSection'
import { WhyChooseSection } from '@/pages/landing/sections/WhyChooseSection'
import { MenuSection } from '@/pages/landing/sections/MenuSection'
import { ExperienceSection } from '@/pages/landing/sections/ExperienceSection'
import { ReservationSection } from '@/pages/landing/sections/ReservationSection'
import { HowItWorksSection } from '@/pages/landing/sections/HowItWorksSection'
import { LoyaltySection } from '@/pages/landing/sections/LoyaltySection'
import { TestimonialsSection } from '@/pages/landing/sections/TestimonialsSection'
import { GallerySection } from '@/pages/landing/sections/GallerySection'
import { StatsSection } from '@/pages/landing/sections/StatsSection'
import { NewsletterSection } from '@/pages/landing/sections/NewsletterSection'

/**
 * The public restaurant site. Section order follows a diner's questions:
 * what is this place (hero) → how do I get the food (services) → why here
 * (why choose) → what's on (menu) → who are you (experience) → book it
 * (reservation) → what happens next (how it works) → why come back
 * (loyalty) → do others rate it (reviews, gallery, stats) → stay in touch
 * (newsletter, then the footer from LandingLayout).
 *
 * reducedMotion="user" makes every Framer Motion animation on this page
 * respect the OS "reduce motion" setting — handled once here rather than
 * in each component. The CSS keyframes have their own media query in
 * styles/index.css.
 */
export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <HeroSection />
      <ServicesSection />
      <WhyChooseSection />
      <MenuSection />
      <ExperienceSection />
      <ReservationSection />
      <HowItWorksSection />
      <LoyaltySection />
      <TestimonialsSection />
      <GallerySection />
      <StatsSection />
      <NewsletterSection />
    </MotionConfig>
  )
}
