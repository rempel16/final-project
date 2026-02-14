import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { getMeId } from "@/shared/lib/me";
import { userApi, type UserProfile } from "@/entities/user/api";

const BIO_MAX = 200;
const NAME_MAX = 80;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const meId = useMemo(() => getMeId(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const close = () => navigate(-1);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const me = await userApi.getMe().catch(() => userApi.getProfile(meId));
        if (!alive) return;

        if (!me) {
          setProfile(null);
          setError("Profile not found");
          return;
        }

        setProfile(me);
        setName(me.name ?? "");
        setBio(me.bio ?? "");
        setAvatarUrl(me.avatarUrl ?? null);
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message ?? "Failed to load profile");
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, [meId]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarUrl(dataUrl);
      setError(null);
    } catch {
      setError("Failed to load image");
    } finally {
      e.target.value = "";
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile || saving) return;

    setSaving(true);
    setError(null);

    try {
      await userApi.updateMe({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl,
      });

      close();
    } catch (err) {
      setError((err as Error).message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={close}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          Edit profile
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack
            spacing={2.25}
            component="form"
            onSubmit={onSubmit}
            autoComplete="off"
            id="edit-profile-form"
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={avatarUrl ?? undefined}
                  sx={{ width: 56, height: 56 }}
                  alt={profile?.username ?? "avatar"}
                />
                <Box>
                  <Typography fontWeight={700}>
                    {profile?.username ?? "unknown"}
                  </Typography>
                  {!!profile?.name && (
                    <Typography variant="body2" color="text.secondary">
                      {profile.name}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Box>
                <Button
                  variant="contained"
                  onClick={handlePhotoClick}
                  disabled={saving}
                >
                  New photo
                </Button>
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Box>
            </Stack>

            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputProps={{ maxLength: NAME_MAX }}
              fullWidth
              disabled={saving}
              helperText={`${name.length} / ${NAME_MAX}`}
            />

            <TextField
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              inputProps={{ maxLength: BIO_MAX }}
              multiline
              minRows={4}
              fullWidth
              disabled={saving}
              helperText={`${bio.length} / ${BIO_MAX}`}
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={close} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          form="edit-profile-form"
          disabled={loading || saving || !profile}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
