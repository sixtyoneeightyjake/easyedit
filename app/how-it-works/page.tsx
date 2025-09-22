export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">How it works</h1>
        <p className="text-xl text-gray-400">
          Edit your images with AI in three simple steps
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">1</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload Image</h3>
          <p className="text-gray-400">
            Upload any image you want to edit. We support JPG, PNG, and other common formats.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">2</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Describe Changes</h3>
          <p className="text-gray-400">
            Tell us what you want to change in simple, natural language. Be specific for best results.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">3</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Get Results</h3>
          <p className="text-gray-400">
            Our AI will process your request and generate the edited image in seconds.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Tips for Better Results</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Be Specific</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Use exact color names instead of "darker" or "lighter"</li>
              <li>• Describe positions clearly ("left side", "background")</li>
              <li>• Mention specific objects or people in the image</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Good Examples</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• "Change the sky to sunset colors"</li>
              <li>• "Remove the person in the red shirt"</li>
              <li>• "Add snow to the ground"</li>
              <li>• "Make the car blue instead of red"</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <a 
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Editing Images
        </a>
      </div>
    </div>
  );
}