import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Tractor, Leaf, Activity, ChevronRight } from 'lucide-react';
import { TERMS } from '../constants/terminology';

export default function Home() {
  return (
    <div className="bg-agri-cream min-h-screen font-sans">
      <Head>
        <title>Smart AgriTech Rover</title>
        <meta name="description" content="Precision farming technology for modern agriculture" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white border-b border-agri-beige py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-agri-green" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">Smart AgriTech</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-sm font-medium text-gray-600 hover:text-agri-green transition-colors">Home</a>
          <a href="#about" className="text-sm font-medium text-gray-600 hover:text-agri-green transition-colors">About</a>
          <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-agri-green transition-colors">Testimonials</a>
          <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-agri-green transition-colors">Contact</a>
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="btn-outline">
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Join Platform
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-agri-cream">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900">
              Precision farming, <br />
              <span className="text-agri-green">automated for you.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 font-light">
              Monitor {TERMS.cropHealth.toLowerCase()}, operate automated rovers, and manage your {TERMS.farm.toLowerCase()} with intelligent, rugged technology built for real farmers.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/register"
                className="bg-agri-green hover:bg-agri-dark text-white text-lg font-bold font-sans tracking-wide px-8 py-4 rounded-md text-center transition-colors shadow-lg flex items-center justify-center sm:inline-flex sm:w-auto"
              >
                Request Platform Access
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop"
              alt="Agricultural field at sunrise"
              className="w-full h-auto rounded-2xl shadow-2xl object-cover border border-agri-beige"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for the Modern {TERMS.farmer}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform connects directly with hardware in your {TERMS.field.toLowerCase()}s to provide actionable insights and automated operations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-agri-beige hover:shadow-md transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Activity className="h-7 w-7 text-agri-green" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{TERMS.cropHealth} AI</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload images or process live video from your {TERMS.rover.toLowerCase()} to instantly detect plant diseases and receive treatment recommendations.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-agri-beige hover:shadow-md transition-shadow">
            <div className="bg-amber-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Tractor className="h-7 w-7 text-amber-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Automated {TERMS.rover}s</h3>
            <p className="text-gray-600 leading-relaxed">
              Control and monitor your agricultural robotics remotely. Schedule {TERMS.fieldTask.toLowerCase()}s and watch operations through the {TERMS.liveCamera.toLowerCase()}.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-agri-beige hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Leaf className="h-7 w-7 text-blue-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Precision {TERMS.spraying}</h3>
            <p className="text-gray-600 leading-relaxed">
              Target specific areas of your {TERMS.field.toLowerCase()} based on AI analysis. Reduce chemical usage and protect your healthy {TERMS.crop.toLowerCase()}s automatically.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1000&auto=format&fit=crop"
              alt="Farmer using technology"
              className="rounded-2xl shadow-xl w-full h-auto object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Smart AgriTech</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We are a team of agricultural engineers, roboticists, and software developers dedicated to bringing precision farming technology to {TERMS.farmer.toLowerCase()}s everywhere.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our mission is to increase yield, reduce chemical usage, and automate repetitive {TERMS.fieldTask.toLowerCase()}s through intelligent, rugged rovers and advanced crop health AI. We build real tools for real {TERMS.farm.toLowerCase()}s.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-agri-cream">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What {TERMS.farmer}s Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from the people who are using our rovers in the {TERMS.field.toLowerCase()} every single day.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-agri-beige">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="text-gray-700 italic mb-6">
                "The automated {TERMS.spraying.toLowerCase()} system cut our pesticide use by 30%. The rover spots the problem and treats only the affected {TERMS.crop.toLowerCase()}s. Incredible technology."
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-agri-green flex items-center justify-center text-white font-bold">R</div>
                <div>
                  <p className="font-bold text-gray-900">Rajesh Patel</p>
                  <p className="text-sm text-gray-500">Wheat {TERMS.farmer}, Gujarat</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-agri-beige">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="text-gray-700 italic mb-6">
                "The crop health AI detected blight a week before my trained agronomist saw it. It paid for itself in the first season by saving my tomato harvest."
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">M</div>
                <div>
                  <p className="font-bold text-gray-900">Maria Garcia</p>
                  <p className="text-sm text-gray-500">Organic Farm, California</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-agri-beige hidden lg:block">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="text-gray-700 italic mb-6">
                "I was skeptical of letting a robot roam my {TERMS.field.toLowerCase()}, but the safety constraints are rock solid. It stops instantly if it detects a person."
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">D</div>
                <div>
                  <p className="font-bold text-gray-900">David Smith</p>
                  <p className="text-sm text-gray-500">Soybean {TERMS.farm}, Iowa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-600 mb-10">
            Interested in deploying our rovers on your {TERMS.farm.toLowerCase()}? Have technical questions? We'd love to hear from you.
          </p>
          <form className="bg-agri-cream p-8 rounded-2xl border border-agri-beige text-left shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-agri-green focus:border-agri-green" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-agri-green focus:border-agri-green" placeholder="your@email.com" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-agri-green focus:border-agri-green" placeholder="How can we help you?"></textarea>
            </div>
            <button type="button" onClick={(e) => { e.preventDefault(); alert('Message sent successfully!'); }} className="btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 sm:px-12 text-center">
        <div className="flex justify-center items-center space-x-2 mb-6">
          <Leaf className="h-6 w-6 text-gray-500" />
          <span className="text-lg font-semibold text-gray-300">Smart AgriTech</span>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Smart AgriTech Rover Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
