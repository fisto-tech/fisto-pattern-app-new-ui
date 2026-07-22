import React, { useEffect, useRef } from 'react';
import Footer from '../components/Footer';
import ReadyMockupBanner from '../components/ReadyMockupBanner';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Icons
import callIcon from '../assets/images/contact/call.webp';
import mailIcon from '../assets/images/contact/mail.webp';
import locationIcon from '../assets/images/contact/location.webp';
import mapImg from '../assets/images/contact/map.webp';

export default function ContactPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const context = gsap.context(() => {
      // Top header load animation
      gsap.fromTo(
        ".contact-header-text",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );

      // Contact Info Blocks
      gsap.fromTo(
        ".contact-info-block",
        { autoAlpha: 0, x: -30 },
        { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".contact-content-section", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );

      // Form
      gsap.fromTo(
        ".contact-form-block",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".contact-content-section", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );

      // Banner Text
      gsap.fromTo(
        ".frame-text",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".frame-banner", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );

      // Banner Image
      gsap.fromTo(
        ".frame-product",
        { autoAlpha: 0, x: 50 },
        { autoAlpha: 1, x: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".frame-banner", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={pageRef} className="flex flex-col min-h-screen bg-[#FBF9F6] w-full font-['Inter']">
      <main className="flex-1 w-full pt-16 lg:pt-24 px-6 lg:px-12 xl:px-20 bg-[#FBF9F6]">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col">
          
          {/* Top Header */}
          <div className="mb-12 px-4 text-left">
            <h1 className="contact-header-text text-3xl lg:text-4xl font-semibold text-black mb-6 uppercase tracking-[0.1em]">
              CONTACT US
            </h1>
            <p className="contact-header-text text-gray-600 text-lg leading-relaxed font-medium  max-w-2xl">
              We'd love hear from you.<br/>
              Whether you have a question about our products,<br/>
              pricing or anything else - our team is ready to answer all your questions.
            </p>
          </div>

          {/* Content Section */}
          <div className="contact-content-section flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-24 bg-[#FBF9F6] px-4">
            
            {/* Left Column - Contact Info */}
            <div className="flex flex-col gap-8 w-full lg:w-1/3">
              
              {/* Phone */}
              <div className="contact-info-block flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FDF8F5] flex items-center justify-center shadow-md border border-[#f5e9df] shrink-0">
                  <img src={callIcon} alt="Phone" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Phone</h3>
                  <div className="flex flex-col text-gray-600 text-sm mb-1 font-medium">
                    <a href="tel:+919994425147" className="hover:text-[#f25900] transition-colors">+91 99944 25147</a>
                    <a href="tel:+917530025147" className="hover:text-[#f25900] transition-colors">+91 75300 25147</a>
                  </div>
                  <p className="text-gray-500 text-[12px]">Mon - Fri, 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              {/* Email */}
              <div className="contact-info-block flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FDF8F5] flex items-center justify-center shadow-md border border-[#f5e9df] shrink-0">
                  <img src={mailIcon} alt="Email" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Email</h3>
                  <div className="flex flex-col text-gray-600 text-sm mb-1 font-medium">
                    <a href="mailto:info@fist-o.com" className="hover:text-[#f25900] transition-colors">info@fist-o.com</a>
                    <a href="mailto:support@fist-o.com" className="hover:text-[#f25900] transition-colors">support@fist-o.com</a>
                  </div>
                  <p className="text-gray-500 text-[12px]">We'll reply within 24 hours</p>
                </div>
              </div>

              {/* Address */}
              <div className="contact-info-block flex items-start gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FDF8F5] flex items-center justify-center shadow-md border border-[#f5e9df] shrink-0">
                  <img src={locationIcon} alt="Address" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Address</h3>
                  <a
                    href="https://maps.app.goo.gl/etVpk1sCk6ULr8vcA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 text-sm leading-relaxed block hover:text-[#f25900] transition-colors font-medium"
                  >
                    10/11, Trichy Rd, Sundaram Brothers Layout, Olympus, Ramanathapuram,<br/>
                    Coimbatore, Tamil Nadu - 641045
                  </a>
                </div>
              </div>

              {/* Map Image */}
              <div className="contact-info-block w-full rounded-3xl overflow-hidden shadow-md border border-[#f5e9df] h-[180px] flex shrink-0 mt-4">
                <img src={mapImg} alt="Location Map" className="w-full h-full object-cover block" />
              </div>

            </div>

            {/* Right Column - Form */}
            <div className="contact-form-block w-full lg:w-2/3 max-w-2xl rounded-3xl p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-50 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h2>
              
              <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Your Name</label>
                    <input type="text" placeholder="Enter your name" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Email Address</label>
                    <input type="email" placeholder="Enter your email" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Phone Number</label>
                  <input type="tel" placeholder="Enter your phone number" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Subject</label>
                  <input type="text" placeholder="How can we help you?" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Message</label>
                  <textarea rows="4" placeholder="Type your message here..." className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400 resize-none"></textarea>
                </div>

                <button type="submit" className="w-full bg-[#2F4629] text-white font-bold text-[17px] rounded-lg py-4 mt-2 hover:opacity-90 transition-opacity border-none cursor-pointer">
                  Submit Message
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Banner */}
          <div className="mb-20">
            <ReadyMockupBanner
              fullWidth
              animated
              target="/editor"
              label="Get in Touch"
              title="Get in"
              titleHighlight="Touch"
              subtitle="We are here to help your business grow with premium packaging mockups."
              showButton={false}
              compact={true}
            />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
