import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

const WEATHER_ICONS = {
  Clear: 'sunny',
  Clouds: 'cloudy',
  Rain: 'rainy',
  Drizzle: 'rainy-outline',
  Thunderstorm: 'thunderstorm',
  Snow: 'snow',
  Mist: 'water-outline',
  Haze: 'water-outline',
  Fog: 'water-outline',
};

const WEATHER_COLORS = {
  Clear: COLORS.systemYellow,
  Clouds: COLORS.systemGray,
  Rain: COLORS.systemBlue,
  Drizzle: COLORS.systemBlue,
  Thunderstorm: COLORS.systemPurple,
  Snow: COLORS.systemTeal,
  Mist: COLORS.systemGray2,
  Haze: COLORS.systemGray2,
  Fog: COLORS.systemGray2,
};

export default function WeatherWidget({ lat, lng }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    fetchWeather();
  }, [lat, lng]);

  const fetchWeather = async () => {
    try {
      // Using Open-Meteo API (free, no API key needed)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=3`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          condition: getConditionFromCode(data.current.weather_code),
          forecast: (data.daily?.time || []).slice(0, 3).map((date, i) => ({
            day: formatDay(date),
            high: Math.round(data.daily.temperature_2m_max[i]),
            low: Math.round(data.daily.temperature_2m_min[i]),
            rain: data.daily.precipitation_probability_max[i],
            condition: getConditionFromCode(data.daily.weather_code[i]),
          })),
        });
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={COLORS.tint} />
      </View>
    );
  }

  if (error || !weather) return null;

  const iconName = WEATHER_ICONS[weather.condition] || 'partly-sunny';
  const iconColor = WEATHER_COLORS[weather.condition] || COLORS.systemYellow;

  return (
    <View style={styles.container}>
      {/* Current weather */}
      <View style={styles.currentRow}>
        <View style={styles.currentMain}>
          <Ionicons name={iconName} size={32} color={iconColor} />
          <Text style={styles.temp}>{weather.temp}°C</Text>
        </View>
        <View style={styles.currentDetails}>
          <Text style={styles.conditionText}>{weather.condition}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="water" size={12} color={COLORS.systemBlue} />
            <Text style={styles.detailText}>{weather.humidity}%</Text>
            <Ionicons name="flag" size={12} color={COLORS.secondaryLabel} />
            <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
          </View>
        </View>
      </View>

      {/* 3-day forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <View style={styles.forecastRow}>
          {weather.forecast.map((day) => (
            <View key={day.day} style={styles.forecastDay}>
              <Text style={styles.forecastDayName}>{day.day}</Text>
              <Ionicons
                name={WEATHER_ICONS[day.condition] || 'partly-sunny'}
                size={18}
                color={WEATHER_COLORS[day.condition] || COLORS.systemYellow}
              />
              <Text style={styles.forecastTemp}>{day.high}°/{day.low}°</Text>
              {day.rain > 0 && (
                <View style={styles.rainChip}>
                  <Ionicons name="water" size={10} color={COLORS.systemBlue} />
                  <Text style={styles.rainText}>{day.rain}%</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function getConditionFromCode(code) {
  if (code === 0 || code === 1) return 'Clear';
  if (code === 2 || code === 3) return 'Clouds';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code >= 85 && code <= 86) return 'Snow';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clear';
}

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString('en', { weekday: 'short' });
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  currentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  temp: {
    ...TYPOGRAPHY.title1,
    color: COLORS.label,
  },
  currentDetails: {
    flex: 1,
  },
  conditionText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  detailText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
    marginRight: SPACING.sm,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  forecastDay: {
    alignItems: 'center',
    gap: 4,
  },
  forecastDayName: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
    color: COLORS.secondaryLabel,
    textTransform: 'uppercase',
  },
  forecastTemp: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '500',
    color: COLORS.label,
  },
  rainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rainText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.systemBlue,
  },
});
