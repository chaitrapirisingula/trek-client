import React from "react";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import Home from "./Home";
import Galaxy from "./Galaxy";
import RunInfo from "./RunInfo";
import About from "./About";

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full bg-gray-900 text-white text-center py-4 text-2xl font-bold h-1/10">
        <Link to="/">trek💫</Link>
      </header>

      {/* Main Content (Allow Growth) */}
      <main className="flex-grow flex flex-col justify-center items-center h-8/10">
        {children}
      </main>

      {/* Footer Always at Bottom */}
      <footer className="w-full bg-gray-900 text-white text-center py-3 mt-auto h-1/10">
        <div className="flex justify-center gap-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/galaxy" className="hover:underline">
            Galaxy
          </Link>
          <Link to="/about" className="hover:underline">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/galaxy",
    element: (
      <Layout>
        <Galaxy />
      </Layout>
    ),
  },
  {
    path: "/animate",
    element: (
      <Layout>
        <RunInfo />
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout>
        <About />
      </Layout>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
