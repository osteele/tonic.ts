/** An *interval quality* distinguishes between [major and
 * minor](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords)
 * intervals, and further augments or diminishes an interval.
 *
 * See [Wikipedia: Interval
 * quality](https://en.wikipedia.org/wiki/Interval_(music)#Quality).
 */
export enum IntervalQuality {
  DoublyDiminished,
  /** A
   * [diminished](https://en.wikipedia.org/wiki/Diminution#Diminution_of_intervals)
   * interval is narrowed by a chromatic semitone.
   */
  Diminished,
  /** A [minor](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords) interval. */
  Minor,
  Perfect,
  /** A [major](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords) interval. */
  Major,
  /** An
   * [augmented](https://en.wikipedia.org/wiki/Augmentation_(music)#Augmentation_of_intervals)
   * interval is widened by a chromatic semitone.
   */
  Augmented,
  DoublyAugmented,
}
