/**
 * ML-Based Transaction Categorization
 * Uses TensorFlow.js for neural network classification
 */

import * as tf from "@tensorflow/tfjs";
import type { CategorizationResult } from "@/types/budget";
import {
  generateTrainingData,
  splitTrainTest,
  getUniqueCategories,
  categoryToOneHot,
  oneHotToCategory,
  type TrainingExample,
} from "./training-data-generator";

/**
 * Simple vocabulary-based text vectorizer
 */
class TextVectorizer {
  private vocabulary: Map<string, number> = new Map();
  private maxFeatures: number;

  constructor(maxFeatures = 100) {
    this.maxFeatures = maxFeatures;
  }

  /**
   * Build vocabulary from training texts
   */
  fit(texts: string[]): void {
    const wordCounts = new Map<string, number>();

    // Count word frequencies
    for (const text of texts) {
      const words = this.tokenize(text);
      for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }

    // Sort by frequency and take top N
    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.maxFeatures)
      .map(([word]) => word);

    // Build vocabulary (word -> index)
    this.vocabulary.clear();
    sortedWords.forEach((word, index) => {
      this.vocabulary.set(word, index);
    });
  }

  /**
   * Transform text to feature vector
   */
  transform(text: string): number[] {
    const vector = new Array(this.maxFeatures).fill(0);
    const words = this.tokenize(text);

    for (const word of words) {
      const index = this.vocabulary.get(word);
      if (index !== undefined) {
        vector[index] += 1; // Bag of words (count)
      }
    }

    return vector;
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2);
  }

  /**
   * Get vocabulary size
   */
  get vocabularySize(): number {
    return this.vocabulary.size;
  }
}

/**
 * ML Categorization Model
 */
export class MLCategorizer {
  private model: tf.LayersModel | null = null;
  private vectorizer: TextVectorizer;
  private categories: string[] = [];
  private isReady = false;

  constructor() {
    this.vectorizer = new TextVectorizer(100);
  }

  /**
   * Train the model on generated training data
   */
  async train(): Promise<{ accuracy: number; loss: number }> {
    console.log("Generating training data...");
    const allData = generateTrainingData();
    const { train, test } = splitTrainTest(allData, 0.2);

    console.log(`Training examples: ${train.length}, Test examples: ${test.length}`);

    // Get unique categories
    this.categories = getUniqueCategories(allData);
    console.log(`Categories: ${this.categories.length}`);

    // Fit vectorizer on training data
    this.vectorizer.fit(train.map((d) => d.text));
    console.log(`Vocabulary size: ${this.vectorizer.vocabularySize}`);

    // Convert training data to tensors
    const trainX = train.map((d) => this.vectorizer.transform(d.text));
    const trainY = train.map((d) => categoryToOneHot(d.category, this.categories));

    const xTrain = tf.tensor2d(trainX);
    const yTrain = tf.tensor2d(trainY);

    // Build model
    this.model = this.buildModel(this.vectorizer.vocabularySize, this.categories.length);

    // Train model
    console.log("Training model...");
    await this.model.fit(xTrain, yTrain, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(
              `Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}, acc = ${logs?.acc.toFixed(4)}`
            );
          }
        },
      },
    });

    // Evaluate on test set
    const testX = test.map((d) => this.vectorizer.transform(d.text));
    const testY = test.map((d) => categoryToOneHot(d.category, this.categories));

    const xTest = tf.tensor2d(testX);
    const yTest = tf.tensor2d(testY);

    const evaluation = this.model.evaluate(xTest, yTest) as tf.Scalar[];
    const loss = await evaluation[0].data();
    const accuracy = await evaluation[1].data();

    // Cleanup
    xTrain.dispose();
    yTrain.dispose();
    xTest.dispose();
    yTest.dispose();
    evaluation[0].dispose();
    evaluation[1].dispose();

    this.isReady = true;

    return {
      loss: loss[0],
      accuracy: accuracy[0],
    };
  }

  /**
   * Build neural network model
   */
  private buildModel(inputSize: number, outputSize: number): tf.LayersModel {
    const model = tf.sequential();

    // Input layer + hidden layers
    model.add(
      tf.layers.dense({
        units: 64,
        activation: "relu",
        inputShape: [inputSize],
      })
    );

    model.add(tf.layers.dropout({ rate: 0.3 }));

    model.add(
      tf.layers.dense({
        units: 32,
        activation: "relu",
      })
    );

    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Output layer
    model.add(
      tf.layers.dense({
        units: outputSize,
        activation: "softmax",
      })
    );

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    return model;
  }

  /**
   * Predict category for a transaction description
   */
  async predict(description: string): Promise<CategorizationResult | null> {
    if (!this.model || !this.isReady) {
      return null;
    }

    try {
      // Vectorize input
      const vector = this.vectorizer.transform(description);
      const inputTensor = tf.tensor2d([vector]);

      // Predict
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.data();

      // Get predicted category
      const category = oneHotToCategory(Array.from(probabilities), this.categories);
      const confidence = Math.max(...probabilities);

      // Cleanup
      inputTensor.dispose();
      prediction.dispose();

      return {
        category,
        subcategory: undefined,
        confidence,
        method: "ml",
      };
    } catch (error) {
      console.error("ML prediction error:", error);
      return null;
    }
  }

  /**
   * Check if model is ready
   */
  get ready(): boolean {
    return this.isReady;
  }

  /**
   * Save model to browser storage
   */
  async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error("Model not trained yet");
    }

    await this.model.save("indexeddb://budget-categorizer");
    localStorage.setItem(
      "categorizer-vocabulary",
      JSON.stringify(Array.from(this.vectorizer["vocabulary"].entries()))
    );
    localStorage.setItem("categorizer-categories", JSON.stringify(this.categories));
  }

  /**
   * Load model from browser storage
   */
  async loadModel(): Promise<boolean> {
    try {
      this.model = await tf.loadLayersModel("indexeddb://budget-categorizer");

      // Load vocabulary and categories
      const vocabData = localStorage.getItem("categorizer-vocabulary");
      const categoriesData = localStorage.getItem("categorizer-categories");

      if (vocabData && categoriesData) {
        const vocabEntries = JSON.parse(vocabData) as [string, number][];
        this.vectorizer["vocabulary"] = new Map(vocabEntries);
        this.categories = JSON.parse(categoriesData);
        this.isReady = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to load model:", error);
      return false;
    }
  }
}

// Singleton instance
let mlCategorizerInstance: MLCategorizer | null = null;

/**
 * Get or create ML categorizer instance
 */
export function getMLCategorizer(): MLCategorizer {
  if (!mlCategorizerInstance) {
    mlCategorizerInstance = new MLCategorizer();
  }
  return mlCategorizerInstance;
}
