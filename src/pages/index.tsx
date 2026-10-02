import React, { useState, useEffect } from 'react';
import { PublicLayout } from '../components/PublicLayout';

export default function Home() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !content) return <PublicLayout><div className="flex items-center justify-center min-h-screen text-[#4A6B53] font-bold">Loading AgriTech...</div></PublicLayout>;

  return (
    <PublicLayout 
      title={content.hero?.title ? `${content.hero.title} | Smart AgriTech` : "Smart AgriTech | Precision Agriculture"}
      description={content.hero?.description || "Empowering modern agriculture with precision automated systems and data-driven insights."}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-6 sm:px-12 bg-[#f9f9f6]">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-[#E9EAE5] rounded-l-full opacity-50 blur-3xl transform translate-x-1/3"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#2C392F]">
              {content.hero?.title || "Precision Agriculture"}
            </h1>
            <p className="text-xl text-[#5C715E] font-light max-w-lg leading-relaxed whitespace-pre-wrap">
              {content.hero?.description}
            </p>
            <div className="flex gap-4 pt-4">
              <a href="#contact" className="bg-[#4A6B53] hover:bg-[#2C392F] text-white text-lg font-bold tracking-wide px-8 py-4 rounded-sm transition-all shadow-lg inline-block">
                Explore Solutions
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-[#E9EAE5] rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white">
                <img src={content.hero?.imageUrl} alt="Smart Farming" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 bg-white px-6 sm:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4A373] mb-4">Vision</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#2C392F] mb-8">{content.vision?.title}</h3>
          <p className="text-xl text-[#5C715E] leading-relaxed whitespace-pre-wrap">
            {content.vision?.description}
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-[#f9f9f6] px-6 sm:px-12 border-t border-[#E9EAE5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4A373] mb-4">Products</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-[#2C392F] mb-6">{content.products?.title}</h3>
            <p className="text-xl text-[#5C715E] max-w-2xl mx-auto">{content.products?.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-[#E9EAE5] rounded-2xl h-80 shadow-inner overflow-hidden border border-white">
               <img src={content.products?.imageUrl} alt="Products" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-3xl font-bold text-[#2C392F] mb-4">AgriRover Platform</h4>
              <p className="text-[#5C715E] text-lg leading-relaxed mb-6">
                Our flagship autonomous rovers are designed for heavy-duty tasks ranging from continuous soil monitoring to precise micro-spraying operations. Connect multiple units to form a synchronized farming fleet.
              </p>
              <a href="#contact" className="text-[#4A6B53] font-bold uppercase tracking-wide text-sm border-b-2 border-[#4A6B53] pb-1 hover:text-[#2C392F] hover:border-[#2C392F] transition-all">Request Spec Sheet</a>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-24 bg-white px-6 sm:px-12 border-t border-[#E9EAE5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4A373] mb-4">Technology</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-[#2C392F] mb-6">{content.technology?.title}</h3>
            <p className="text-xl text-[#5C715E] max-w-2xl mx-auto">{content.technology?.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h4 className="text-3xl font-bold text-[#2C392F] mb-4">Edge Analytics</h4>
              <p className="text-[#5C715E] text-lg leading-relaxed mb-6">
                Powered by proprietary neural networks, our systems execute decisions on the device, eliminating latency and the need for constant cloud connectivity in remote fields.
              </p>
            </div>
            <div className="order-1 md:order-2 bg-[#E9EAE5] rounded-2xl h-80 shadow-inner overflow-hidden border border-white">
              <img src={content.technology?.imageUrl} alt="Technology" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section id="applications" className="py-24 bg-[#f9f9f6] px-6 sm:px-12 border-t border-[#E9EAE5]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4A373] mb-4">Applications</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#2C392F] mb-6">{content.applications?.title}</h3>
          <p className="text-xl text-[#5C715E] max-w-2xl mx-auto mb-12">{content.applications?.description}</p>
          <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-xl border border-[#E9EAE5]">
            <img src={content.applications?.imageUrl} alt="Applications" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="founders" className="py-24 bg-white px-6 sm:px-12 border-t border-[#E9EAE5]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4A373] mb-4">Team</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#2C392F] mb-6">{content.founders?.title}</h3>
          <p className="text-xl text-[#5C715E] max-w-2xl mx-auto mb-16">{content.founders?.description}</p>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto text-left">
            <div className="p-8 bg-[#f9f9f6] rounded-xl border border-[#E9EAE5]">
              <h4 className="text-2xl font-bold text-[#2C392F] mb-2">CEO & Founder</h4>
              <p className="text-[#D4A373] font-bold text-sm uppercase tracking-wider mb-4">Vision & Strategy</p>
              <p className="text-[#5C715E] leading-relaxed">Driving the overall mission to bring enterprise-grade robotics into the hands of modern commercial farmers.</p>
            </div>
            <div className="p-8 bg-[#f9f9f6] rounded-xl border border-[#E9EAE5]">
              <h4 className="text-2xl font-bold text-[#2C392F] mb-2">CTO & Founder</h4>
              <p className="text-[#D4A373] font-bold text-sm uppercase tracking-wider mb-4">Engineering & Hardware</p>
              <p className="text-[#5C715E] leading-relaxed">Leading the development of ruggedized drivetrains and the proprietary edge AI vision systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#2C392F] px-6 sm:px-12 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4A373] mb-4">Contact Us</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold mb-6">{content.contact?.title}</h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 whitespace-pre-wrap">{content.contact?.description}</p>
          <a href="mailto:enterprise@agritech.com" className="bg-[#D4A373] hover:bg-white text-[#2C392F] text-lg font-bold tracking-wide px-10 py-4 rounded-sm transition-all shadow-lg inline-block">
            Request Enterprise Consultation
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
