import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from "react-native";
import Layout from "../layout";

const SentimentAnalysis = () => {
  const [comment, setComment] = useState("");
  const [result, setResult] = useState("");
  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);
  const [reviews, setReviews] = useState([]);

  const getPrediction = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please enter a comment.");
      return;
    }

    try {
      const response = await fetch("http://192.168.184.18:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      });

      if (!response.ok) throw new Error("Failed to get prediction");

      const data = await response.json();
      setResult(`Prediction: ${data.prediction}`);

      // ✅ Fix count update
      if (data.prediction === "negative") {
        setNegativeCount((prevCount) => prevCount + 1);
      } else {
        setPositiveCount((prevCount) => prevCount + 1);
      }

      // ✅ Update review list
      setReviews((prevReviews) => [
        { key: Math.random().toString(), text: comment, prediction: data.prediction },
        ...prevReviews,
      ]);

      setComment(""); // ✅ Clear input after submission
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Sentiment Analysis</Text>
        <TextInput
          style={styles.input}
          placeholder="Write your comment here..."
          value={comment}
          onChangeText={setComment}
        />
        <Button title="Check Sentiment" onPress={getPrediction} />
        <Text style={styles.result}>{result}</Text>
        <Text style={styles.counts}>Positive: {positiveCount}</Text>
        <Text style={styles.counts}>Negative: {negativeCount}</Text>
        <Text style={styles.title}>Recent Reviews</Text>
        <FlatList
          data={reviews}
          renderItem={({ item }) => (
            <Text style={styles.review}>
              {item.text} - ({item.prediction})
            </Text>
          )}
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  result: {
    marginTop: 10,
    fontWeight: "bold",
  },
  counts: {
    fontSize: 16,
    marginTop: 10,
  },
  review: {
    fontSize: 16,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default SentimentAnalysis;