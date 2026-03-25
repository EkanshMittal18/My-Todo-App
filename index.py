import matplotlib.pyplot as plt

# Raw data (example: students marks)
data = [45, 50, 55, 60, 65]

# Bar Chart
plt.bar(range(len(data)), data)
plt.title("Bar Chart of Marks")
plt.xlabel("Students")
plt.ylabel("Marks")
plt.show()

# Histogram
plt.hist(data, bins=5)
plt.title("Histogram of Marks Distribution")
plt.xlabel("Marks")
plt.ylabel("Frequency")
plt.show()