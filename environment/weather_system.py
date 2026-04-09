def update_weather(state):
    # Deterministic weather cycle every 6 hours
    weather_cycle = ["sunny", "cloudy", "rainy", "sunny"]
    index = (state["time"] // 6) % 4
    state["weather"] = weather_cycle[index]