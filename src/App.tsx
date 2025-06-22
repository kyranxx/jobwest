
import Image from "next/image";
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/logo.png" alt="JobWest" width={32} height={32} className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">JobWest</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to JobWest
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your project is now set up and ready to be modernized with React, TypeScript, and Tailwind CSS!
          </p>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready for Development</h3>
            <p className="text-gray-600">
              The project structure is now in place. You can start building your job portal features!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
