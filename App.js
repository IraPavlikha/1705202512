import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Button,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';

const Stack = createNativeStackNavigator();

const UserDetailsScreen = ({ route }) => {
    const { user } = route.params;

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 22 }}>{user.name.first} {user.name.last}</Text>
            <Text>Email: {user.email}</Text>
            <Text>Phone: {user.phone}</Text>
            <Text>Country: {user.location.country}</Text>
        </View>
    );
};

const UsersScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nationality, setNationality] = useState('us');
    const [page, setPage] = useState(1);

    const [editingUserId, setEditingUserId] = useState(null);
    const [editedFirstName, setEditedFirstName] = useState('');

    const fetchUsers = (nat, pageNum) => {
        setLoading(true);
        fetch(`https://randomuser.me/api/?results=10&nat=${nat}&page=${pageNum}`)
            .then(res => res.json())
            .then(data => setUsers(data.results))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers(nationality, page);
    }, [nationality, page]);

    const handleNextPage = () => setPage(prev => prev + 1);
    const handlePrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleNationalityChange = (value) => {
        setNationality(value);
        setPage(1);
    };

    const handleDelete = (uuid) => {
        setUsers(prevUsers => prevUsers.filter(user => user.login.uuid !== uuid));
    };

    const startEditing = (user) => {
        setEditingUserId(user.login.uuid);
        setEditedFirstName(user.name.first);
    };

    const saveEditing = (uuid) => {
        setUsers(prevUsers => prevUsers.map(user => {
            if (user.login.uuid === uuid) {
                return {
                    ...user,
                    name: {
                        ...user.name,
                        first: editedFirstName,
                    }
                };
            }
            return user;
        }));
        setEditingUserId(null);
        setEditedFirstName('');
    };

    const cancelEditing = () => {
        setEditingUserId(null);
        setEditedFirstName('');
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Picker
                selectedValue={nationality}
                onValueChange={handleNationalityChange}
                style={{ marginBottom: 10 }}
            >
                <Picker.Item label="🇺🇸 US" value="us" />
                <Picker.Item label="🇬🇧 UK" value="gb" />
                <Picker.Item label="🇫🇷 France" value="fr" />
                <Picker.Item label="🇺🇦 Ukraine" value="ua" />
                <Picker.Item label="🇩🇪 Germany" value="de" />
            </Picker>

            {loading ? (
                <ActivityIndicator size="large" color="gray" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => item.login.uuid}
                    renderItem={({ item }) => (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottomWidth: 1,
                            borderBottomColor: '#ddd',
                            paddingVertical: 10,
                            paddingHorizontal: 5
                        }}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => navigation.navigate('UserDetails', { user: item })}
                            >
                                {editingUserId === item.login.uuid ? (
                                    <TextInput
                                        value={editedFirstName}
                                        onChangeText={setEditedFirstName}
                                        style={{
                                            fontSize: 18,
                                            borderBottomWidth: 1,
                                            borderBottomColor: 'gray',
                                            paddingVertical: 0,
                                        }}
                                    />
                                ) : (
                                    <Text style={{ fontSize: 18 }}>
                                        {item.name.first} {item.name.last}
                                    </Text>
                                )}
                                <Text style={{ color: 'gray' }}>{item.phone}</Text>
                            </TouchableOpacity>

                            {editingUserId === item.login.uuid ? (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => saveEditing(item.login.uuid)} style={{ marginRight: 10 }}>
                                        <Icon name="check" color="green" size={24} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={cancelEditing}>
                                        <Icon name="close" color="red" size={24} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => startEditing(item)} style={{ marginRight: 15 }}>
                                        <Icon name="edit" color="gray" size={24} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.login.uuid)}>
                                        <Icon name="delete" color="gray" size={24} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                />
            )}

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10
            }}>
                <Button title="⬅️ Попередня" onPress={handlePrevPage} disabled={page === 1} />
                <Text style={{ alignSelf: 'center' }}>Сторінка: {page}</Text>
                <Button title="Наступна ➡️" onPress={handleNextPage} />
            </View>
        </View>
    );
};

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Користувачі' }} />
                <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ title: 'Інфо' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
