import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaClock, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const Contact = () => {
  const email = 'fithub601@gmail.com';
  const mapsUrl = 'https://maps.app.goo.gl/fepBVnyZzEzjiQuk6';
  const mapEmbed = 'https://www.google.com/maps?q=place_id:0x3be7b79949cf7ca5:0x98b7d3c4ba39810f&output=embed';

  const cards = [
    {
      icon: <FaEnvelope />,
      title: 'Email Us',
      desc: 'Drop us a mail anytime — we reply fast',
      value: email,
      href: `mailto:${email}`,
      cta: 'Send an Email',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <FaClock />,
      title: 'Working Hours',
      desc: 'Open every day of the week',
      value: '6AM - 10PM',
      sub: 'MONDAY - SATURDAY',
      href: null,
      color: 'from-red-500 to-amber-500'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Find the Gym',
      desc: 'Tap to open the location on Google Maps',
      value: 'FITHUB Gymnasium',
      href: mapsUrl,
      cta: 'Open in Google Maps',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="kicker">CONTACT US</span>
            <h1 className="font-display text-5xl text-slate-900 mt-2 mb-3">
              GET IN <span className="text-orange-500">TOUCH</span>
            </h1>
            <p className="text-slate-500">Reach out, drop in, or find us on the map</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all p-7 flex flex-col"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl text-white mb-5 shadow-glow`}>
                  {card.icon}
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-1.5">{card.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{card.desc}</p>
                <div className="mt-auto">
                  <p className="font-display text-xl text-slate-900 break-all">{card.value}</p>
                  {card.sub && <p className="text-xs font-bold text-orange-500 tracking-widest mt-1">{card.sub}</p>}
                  {card.href && (
                    <a
                      href={card.href}
                      target={card.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
                    >
                      {card.cta} <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden"
          >
            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="kicker">FIND US</span>
                <h2 className="font-display text-2xl text-slate-900 mt-1">OUR LOCATION</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Samarth Gym · M Ward, Municipal Colony, Sector B, Goregaon East, Mumbai 400065
                </p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity shadow-glow"
              >
                Open in Google Maps <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
            <div className="border-t border-slate-100">
              <iframe
                title="FITHUB Gym Location"
                src={mapEmbed}
                className="w-full h-[420px]"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;