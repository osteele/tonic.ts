export const SharpNoteNames = 'C C# D D# E F F# G G# A A# B'
  .replace(/#/g, '\u266F')
  .split(/\s/);

export const FlatNoteNames = 'C Db D Eb E F Gb G Ab A Bb B'
  .replace(/b/g, '\u266D')
  .split(/\s/);
export const NoteNames = SharpNoteNames;
