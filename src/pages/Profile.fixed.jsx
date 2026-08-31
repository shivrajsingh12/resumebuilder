import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const emptyProfile = {
  name: "",
  email: "",
  school: "",
  course: "",
  goal: "",
  bio: "",
  location: "",
  website: "",
};

export default function Profile() {
  const { user, saveProfile } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const nextProfile = {
      ...emptyProfile,
      ...(user.profile || {}),
      name: user.profile?.name || user.displayName || "",
      email: user.profile?.email || user.email || "",
    };

    setProfile(nextProfile);
  }, [user]);

  const completeCount = useMemo(() => {
    return Object.values(profile).filter(
      (value) => typeof value === "string" && value.trim().length > 0,
    ).length;
  }, [profile]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setSaving(true);

    const result = await saveProfile(profile);
    setSaving(false);
    setStatus(result.message);
  };

  return (
    <main className="folio-page profile-page">
      <section className="page-heading">
        <p className="eyebrow">Your profile</p>
        <h1>
          Keep your career story <i>close at hand.</i>
        </h1>
        <p>
          Your profile is stored securely in your own Firebase account and used only for your resume builder experience.
        </p>
      </section>

      <section className="profile-grid">
        <aside className="profile-card profile-progress">
          <div className="profile-progress__avatar">
            {(profile.name || "F")
              .split(/\s+/)
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "F"}
          </div>
          <h2>{profile.name || "Your profile"}</h2>
          <p>
            {completeCount} of {Object.keys(emptyProfile).length} profile details complete
          </p>
          <div className="profile-progress__bar">
            <i style={{ width: `${(completeCount / Object.keys(emptyProfile).length) * 100}%` }} />
          </div>
          <small>Keep your details up to date for better resume suggestions.</small>
        </aside>

        <form className="profile-card profile-form" onSubmit={handleSubmit}>
          {status && (
            <div
              className={`auth-message ${status.toLowerCase().includes("success") ? "auth-message--success" : "auth-message--error"}`}
            >
              {status}
            </div>
          )}

          <div className="profile-form__row">
            <label>
              <span>Full name</span>
              <input name="name" value={profile.name} onChange={updateField} required />
            </label>

            <label>
              <span>Email</span>
              <input name="email" type="email" value={profile.email} onChange={updateField} required />
            </label>
          </div>

          <div className="profile-form__row">
            <label>
              <span>School or university</span>
              <input
                name="school"
                value={profile.school}
                onChange={updateField}
                placeholder="e.g. Delhi University"
              />
            </label>

            <label>
              <span>Course or focus</span>
              <input
                name="course"
                value={profile.course}
                onChange={updateField}
                placeholder="e.g. Computer Science"
              />
            </label>
          </div>

          <div className="profile-form__row">
            <label>
              <span>Current goal</span>
              <input
                name="goal"
                value={profile.goal}
                onChange={updateField}
                placeholder="e.g. Product designer"
              />
            </label>

            <label>
              <span>Location</span>
              <input
                name="location"
                value={profile.location}
                onChange={updateField}
                placeholder="e.g. Bengaluru, India"
              />
            </label>
          </div>

          <label>
            <span>Bio</span>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={updateField}
              placeholder="Tell employers a bit about yourself."
              rows="4"
            />
          </label>

          <label>
            <span>Portfolio or website</span>
            <input
              name="website"
              value={profile.website}
              onChange={updateField}
              placeholder="https://yourportfolio.com"
            />
          </label>

          <div className="profile-form__actions">
            <button type="submit" className="auth-button" disabled={saving}>
              {saving ? "Saving profile..." : "Save profile"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
