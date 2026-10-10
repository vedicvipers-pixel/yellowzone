# CTF flag submission and room recovery visuals

- CTFs now use a free-response flag field instead of multiple-choice answers.
- Players are told to submit `FLAG{YOUR_FINDING_HERE}` and must derive the token from the supplied evidence.
- Flags are checked case-insensitively after trimming whitespace. Invalid formats and incorrect flags do not unlock the dataset.
- Successful submissions retain the existing CTF completion flow and unlock the single terminal's dataset mode.
- Once a room's CTF is complete, its lighting transitions to pulsing emerald/cyan recovery lights and an animated floor ring, with green/cyan architectural edge accents.

The current answer checking is client-side for this local prototype. For a public or competitive deployment, move flag validation to a server so answer keys are not bundled in the client.
