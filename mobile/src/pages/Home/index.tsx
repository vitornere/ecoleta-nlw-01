import React, { useState, useEffect, ChangeEvent } from "react";
import {
  View,
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import api from "../../services/api";

const Home = () => {
  const [ufs, setUFs] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState('0');
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('0');
  interface IBGEUFResponse {
    sigla: string
  }

  interface IBGECitiesResponse {
    nome: string
  }

  const navigation = useNavigation();

  useEffect(() => {
    api
      .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => {
        const ufInitials = res.data.map(uf => uf.sigla);
        setUFs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUF !== '0') {
      api
        .get<IBGECitiesResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(res => {
          const cities = res.data.map(city => city.nome);
          setCities(cities);
        });
    }
  }, [selectedUF]);

  function handleSelectUF(value: string) {
    const uf = value;
    setSelectedUF(uf);
  }

  function handleSelectCity(value: string) {
    const city = value;
    setSelectedCity(city);
  }

  function handleNavigateToPoints() {
    navigation.navigate('Points', { uf: selectedUF, city: selectedCity })
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground
        source={require('../../assets/home-background.png')}
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={require("../../assets/logo.png")} />
          <Text style={styles.title}>
            Seu marketplace de coleta de resíduos
        </Text>
          <Text style={styles.description}>
            Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente
        </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.input}>
            <RNPickerSelect
              onValueChange={handleSelectUF}
              items={ufs.map(name => ({label: name, value: name}))}
              placeholder={{ label: 'Seleciona uma UF', value: null }}
            />
          </View>
          <View style={styles.input}>
            <RNPickerSelect
              disabled={selectedUF === '0'}
              onValueChange={handleSelectCity}
              items={cities.map(city => ({label: city, value: city}))}
              placeholder={{ label: 'Seleciona uma Cidade', value: null }}
            />
          </View>

          <RectButton
            enabled={selectedCity !== '0' && selectedUF !== '0'}
            style={styles.button} 
            onPress={handleNavigateToPoints}
          >
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name='arrow-right' color='#FFF' size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});

export default Home;
