🌾 KrishiConnect

Team Invincible

Welcome to the KrishiConnect repository! This project is our solution to a massive problem in the agricultural sector: the lack of trust and transparency between farmers and buyers. We built a platform that handles everything from contract creation to payments, ensuring farmers get paid fairly and buyers get the quality they expect.

📖 The Idea
Farming in India often involves too many middlemen, which means less profit for the farmer. Even when farmers try to sell directly, there's a huge trust deficit—"What if the buyer doesn't pay?" or "What if the crop quality is bad?"

KrishiConnect bridges this gap.

We created a secure peer-to-peer (P2P) platform for contract farming. The core innovation here is our Escrow Payment System. When a buyer wants to contract a farmer, they deposit the money into a secure escrow account. This money is released in stages (we call them milestones) only after the farmer uploads proof of work (like photos of sowing or harvesting). This way, the farmer knows the money is there, and the buyer knows work is getting done.

✨ What Makes It Special?
We didn't just stop at contracts. We wanted this to be a complete ecosystem for the farmer.

🔐 Secure & Easy Access
We know users hate remembering new passwords. We've integrated Google Authentication (via Supabase) so farmers and buyers can log in securely with a single tap.

🤝 Contract Farming with Escrow
This is the heart of the app. It features a real-time negotiation chat where both parties can agree on price and quantity. Once agreed, the smart contract kicks in. The milestone-based release ensures safety for both sides.

🤖 Multilingual AI Companion
Language shouldn't be a barrier to technology. We integrated a Multilingual AI Chatbot that allows farmers to ask questions in their local language. Whether it's about government schemes or general farming advice, the bot understands and replies in the language they are comfortable with.

🩺 Disease Detection
Farmers can snap a photo of their crop (currently optimized for Cotton and Tomato), and our model (hosted on Hugging Face) will instantly detect diseases and recommend the right pesticide.

🚜 Marketplace & Resources
We also added a section for logistics booking, renting farm machinery, and checking live Mandi prices, making it a one-stop-shop.

🛠️ The Tech Stack
We used a modern full-stack approach to keep the app fast and scalable.

Frontend:

React (Vite): For a snappy, responsive UI.
Tailwind CSS: For styling.
Supabase Auth: Handling our Google Authentication and user sessions.

Backend:

FastAPI (Python): We chose this for its speed and easy integration with AI libraries.
PostgreSQL: Our primary database, hosted on Supabase.
Docker: Used to containerize the application for consistent development and deployment.

Artificial Intelligence:

Google Gemini Flash 2.5: Powers our text-based advisory.
Hugging Face: Hosts our computer vision models for crop disease detection.
