'use client';

import Link from 'next/link';
import LoginButton from './component/login';
import { FaTasks, FaUsers, FaChartLine, FaCoffee } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-0 px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <Link href="/" aria-label="Home">
              <FaCoffee className="text-white w-8 h-8" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Manage Your Projects with Ease
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Streamline tasks, collaborate with your team, and track progress—all in one place.
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Why Choose Our App?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FaTasks className="text-blue-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Management</h3>
              <p className="text-gray-600">
                Organize tasks with intuitive boards, lists, and timelines to keep projects on track.
              </p>
            </div>
            <div className="text-center">
              <FaUsers className="text-blue-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Assign tasks, share updates, and work together seamlessly in real-time.
              </p>
            </div>
            <div className="text-center">
              <FaChartLine className="text-blue-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor project milestones and generate reports to stay informed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Started Today
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of teams managing their projects with our app. Sign in now to explore!
          </p>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Chai App</h3>
              <p className="text-gray-400">
                Empowering teams to manage projects efficiently and collaboratively.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-400 hover:text-blue-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="/support" className="text-gray-400 hover:text-blue-400">
                    Support
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-blue-400">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">Email: support@myapp.com</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            © {new Date().getFullYear()} Chai App. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
