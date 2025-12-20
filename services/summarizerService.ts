import { pipeline, Pipeline } from '@xenova/transformers';

/**
 * A singleton class to manage the summarization pipeline instance.
 * This ensures the model is loaded only once per session.
 */
class SummarizerPipeline {
  private static instance: Pipeline | null = null;
  private static loadingPromise: Promise<Pipeline> | null = null;

  static async getInstance(progress_callback?: (progress: any) => void): Promise<Pipeline> {
    if (this.instance) {
      return this.instance;
    }

    if (!this.loadingPromise) {
      // Load the summarization pipeline.
      // 'Xenova/distilbart-cnn-6-6' is a good balance of speed and quality for client-side execution.
      this.loadingPromise = pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
        progress_callback,
      }).then(instance => {
        this.instance = instance;
        this.loadingPromise = null; // Clear promise after loading
        return instance;
      });
    }

    return this.loadingPromise;
  }
}

/**
 * Summarizes a given text using a client-side transformer model.
 * @param text The text content to summarize.
 * @param progress_callback Optional callback to track model download progress.
 * @returns A promise that resolves to the summarized text.
 */
export const summarizeText = async (
    text: string,
    progress_callback?: (progress: any) => void
): Promise<string> => {
    try {
        const summarizer = await SummarizerPipeline.getInstance(progress_callback);

        // Define a reasonable max length for the input to keep client-side processing snappy.
        // The model can handle more, but this is a good UX choice.
        const MAX_INPUT_LENGTH_CHARS = 8000;
        const truncatedText = text.substring(0, MAX_INPUT_LENGTH_CHARS);

        const output = await summarizer(truncatedText, {
            max_length: 500, // Ideal length of the summary
            min_length: 100, // Minimum length of the summary
            truncation: true,
        });

        // The output is an array like: [{ summary_text: '...' }]
        if (Array.isArray(output) && output.length > 0 && typeof output[0].summary_text === 'string') {
            return output[0].summary_text;
        }

        throw new Error("Summarization resulted in an invalid output format.");
    } catch (error) {
        console.error("Error during text summarization:", error);
        throw new Error("Failed to summarize the document. The summarization model may have failed to load or run correctly.");
    }
};