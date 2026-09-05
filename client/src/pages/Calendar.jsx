import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Stickers from '../components/Stickers';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TYPE_EMOJI = { event: '🎉', class: '🏋️', holiday: '🏖️', other: '📌' };

const dateKey = (d) => {
  const dt = new Date(d);
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${m}-${day}`;
};

const Calendar = () => {
  const { user } = useAuth();
  const today = new Date();

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [events, setEvents] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    setLoading(true);
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    api.get('/events', { params: { start: dateKey(start), end: dateKey(end) } })
      .then(res => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => {
    if (!user) { setMemberships([]); return; }
    api.get('/members/me')
      .then(res => setMemberships(res.data.memberships || []))
      .catch(() => setMemberships([]));
  }, [user]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [year, month]);

  const eventMap = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const k = dateKey(new Date(ev.date));
      (map[k] = map[k] || []).push(ev);
    });
    return map;
  }, [events]);

  const memberMap = useMemo(() => {
    const map = {};
    memberships.forEach(m => {
      if (!m.startDate || !m.endDate) return;
      const expired = new Date(m.endDate) < new Date();
      map[dateKey(new Date(m.startDate))] = { kind: 'start', plan: m.subscription?.name, expired };
      map[dateKey(new Date(m.endDate))] = { kind: 'expiry', plan: m.subscription?.name, expired };
    });
    return map;
  }, [memberships]);

  const activeMembership = memberships.find(m => m.status === 'active');
  const daysToExpiry = activeMembership
    ? Math.ceil((new Date(activeMembership.endDate) - today) / (1000 * 60 * 60 * 24))
    : null;

  const go = (offset) => setViewDate(new Date(year, month + offset, 1));
  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const selectedKey = dateKey(selected);
  const dayEvents = eventMap[selectedKey] || [];
  const dayMember = memberMap[selectedKey];

  const upcoming = useMemo(() => {
    const now = dateKey(today);
    return events
      .filter(ev => dateKey(new Date(ev.date)) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, today]);

  const cellClass = (d) => {
    const isToday = d && dateKey(d) === dateKey(today);
    const isSelected = d && dateKey(d) === dateKey(selected);
    let cls = 'relative flex flex-col items-center justify-center rounded-xl transition-all w-full h-11 sm:h-14 text-sm sm:text-base ';
    if (isToday) {
      cls += 'bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold shadow-lift ';
    } else {
      cls += 'hover:bg-orange-50 text-slate-700 ';
      if (isSelected) cls += 'ring-2 ring-orange-500 bg-orange-50 ';
    }
    return cls;
  };

  const statusStyle = {
    active: 'bg-emerald-100 text-emerald-700',
    expiring: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-100 text-red-600'
  };

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
            <div>
              <span className="kicker">FITNESS CALENDAR</span>
              <h1 className="font-display text-4xl text-slate-900 mt-1">
                GYM <span className="text-orange-500">SCHEDULE</span>
              </h1>
              <p className="text-slate-500 mt-1">Plan your month — classes, events and membership dates</p>
            </div>
            {activeMembership && (
              <Link
                to="/subscriptions"
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full hover:opacity-90 shadow-soft"
              >
                Upgrade Plan
              </Link>
            )}
          </div>

          <div className="mt-2">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Calendar card */}
              <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-soft p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => go(-1)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors" aria-label="Previous month">
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <div className="text-center">
                    <p className="font-display text-2xl text-slate-900">{MONTHS[month]} <span className="text-orange-500">{year}</span></p>
                    <button onClick={goToday} className="text-xs text-primary-500 hover:underline font-medium">Today</button>
                  </div>
                  <button onClick={() => go(1)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors" aria-label="Next month">
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>

                <div className="mb-2">
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
                    {WEEKDAYS.map(d => (
                      <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {cells.map((d, i) => {
                      if (!d) return <div key={i} />;
                      const key = dateKey(d);
                      const evs = eventMap[key] || [];
                      const mm = memberMap[key];
                      const isToday = key === dateKey(today);
                      return (
                        <button key={i} onClick={() => setSelected(d)} className={cellClass(d)} aria-label={dateKey(d)}>
                          <span>{d.getDate()}</span>
                          {(evs.length > 0 || mm) && (
                            <span className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                              {evs.slice(0, 3).map((ev, j) => (
                                <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color || '#f97316' }}></span>
                              ))}
                              {mm && (
                                <span className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : mm.kind === 'start' ? 'bg-emerald-500' : mm.expired ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f97316' }}></span> Event</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span> Class</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Membership start</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Expiry (upcoming)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Expired</span>
                </div>
              </div>

              {/* Selected day + upcoming */}
              <div className="w-full md:w-80 lg:w-96 space-y-5">
                {/* Selected date panel */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Selected Date</p>
                  <h3 className="font-display text-xl text-slate-900 mb-1">
                    {new Date(selected).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>

                  {dayMember && (
                    <div className={`mt-3 px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 ${dayMember.kind === 'start' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : dayMember.expired ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                      {dayMember.kind === 'start' ? '🟢 Membership start' : dayMember.expired ? '🔴 Membership expired' : '🟡 Membership expiry'}
                      {dayMember.plan && <span className="font-semibold">· {dayMember.plan}</span>}
                    </div>
                  )}

                  <div className="mt-4 space-y-2.5">
                    {loading ? (
                      <p className="text-sm text-slate-400 py-6 text-center">Loading events...</p>
                    ) : dayEvents.length === 0 ? (
                      <p className="text-sm text-slate-400 py-6 text-center rounded-2xl bg-slate-50 border border-slate-100">No events on this day 🏋️</p>
                    ) : (
                      dayEvents.map(ev => (
                        <div key={ev._id} className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${ev.color || '#f97316'}22` }}>
                            {TYPE_EMOJI[ev.type] || '📌'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                            {ev.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{ev.description}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming events */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
                  <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-4"><span className="text-orange-500 mr-1.5">✦</span>Upcoming Events</h4>
                  {upcoming.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No upcoming events yet</p>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {upcoming.slice(0, 6).map(ev => (
                        <div key={ev._id} className="flex items-center gap-3">
                          <div className="min-w-[3.2rem] text-center bg-slate-50 rounded-xl border border-slate-100 px-2 py-1.5">
                            <p className="text-orange-600 font-display font-bold text-sm leading-none">{new Date(ev.date).getDate()}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{MONTHS[new Date(ev.date).getMonth()].slice(0, 3)}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{ev.title}</p>
                            {ev.description && <p className="text-xs text-slate-400 truncate">{ev.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Membership expiry alert */}
            {activeMembership && daysToExpiry <= 30 && (
              <div className={`mt-6 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${daysToExpiry < 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <div>
                  <h3 className={`font-bold ${daysToExpiry < 0 ? 'text-red-700' : 'text-amber-700'}`}>
                    {daysToExpiry < 0
                      ? '🔴 Your membership has expired.'
                      : `⚠️ Your membership expires in ${daysToExpiry === 0 ? 'less than a day' : `${daysToExpiry} day${daysToExpiry > 1 ? 's' : ''}`}.`}
                  </h3>
                  <p className={`text-sm mt-1 ${daysToExpiry < 0 ? 'text-red-500' : 'text-amber-600'}`}>
                    {activeMembership.subscription?.name} plan · {new Date(activeMembership.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
                    Renew now to continue your fitness journey.
                  </p>
                </div>
                <Link to="/subscriptions" className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:opacity-90 shadow-soft">
                  Renew Membership
                </Link>
              </div>
            )}

            {/* Membership status pills, if any */}
            {memberships.length > 0 && (
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {memberships.slice(0, 3).map(m => (
                  <div key={m._id} className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{m.subscription?.name || 'Membership'}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(m.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(m.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-full ${statusStyle[m.validity?.status] || 'bg-slate-100 text-slate-600'}`}>
                      {m.validity?.emoji || ''} {m.validity?.label || m.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="pb-10 flex justify-center">
        <Stickers count={4} />
      </div>
    </div>
  );
};

export default Calendar;