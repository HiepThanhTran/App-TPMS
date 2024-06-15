import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform, Image, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import All from "./All.js";
import GlobalStyle from "../../styles/Style.js";
import { Entypo, AntDesign, Ionicons } from '@expo/vector-icons';
import { formatDate } from "../../utils/Utilities.js";
import DateTimePicker from '@react-native-community/datetimepicker';
import APIs, { endPoints, authAPI } from "../../configs/APIs.js";
import { statusCode } from "../../configs/Constants.js";
import * as ImagePicker from 'expo-image-picker';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/common/Loading";

const CreateActivityForm = () => {
   const [nameActivity, setNameActivity] = useState("");
   const [participant, setParticipant] = useState("");
   const [startDate, setStartDate] = useState(new Date());
   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
   const [endDate, setEndDate] = useState(new Date());
   const [showEndDatePicker, setShowEndDatePicker] = useState(false);
   const [location, setLocation] = useState("");
   const [point, setPoint] = useState("");
   const [bulletins, setBulletins] = useState([]);
   const [dropdownBulletin, setDropDownBulletin] = useState("");
   const [faculties, setFaculties] = useState([]);
   const [dropdownFaculty, setDropDownFaculty] = useState("");
   const [semesters, setSemesters] = useState([]);
   const [dropdownSemester, setDropDownSemester] = useState("");
   const [criterions, setCriterions] = useState([]);
   const [dropdownCriterion, setDropDownCriterion] = useState("");
   const [selectedImage, setSelectedImage] = useState(null);
   const [isLoadingImage, setIsLoadingImage] = useState(false);
   const [dropdownOrganizer, setDropDownOrganizer] = useState("Onl");
   const [description, setDescription] = useState("");
   const richText = useRef(null);

   const onChangeStartDate = (event, selectedDate) => {
      const currentDate = selectedDate || startDate;
      setShowStartDatePicker(Platform.OS === 'ios');
      setStartDate(currentDate);
   };

   const onChangeEndDate = (event, selectedDate) => {
      const currentDate = selectedDate || endDate;
      setShowEndDatePicker(Platform.OS === 'ios');
      setEndDate(currentDate);
   };

   const loadCriterions = useCallback(async () => {
      try {
         let res = await APIs.get(endPoints['criterions']);
         if (res.status === statusCode.HTTP_200_OK) {
            setCriterions(res.data);
         }
      } catch (error) {
         console.error(error);
      }
   }, []);

   useEffect(() => {
      loadCriterions();
   }, []);

   const loadBulletins = async () => {
      let bulletinsArray = [];
      let i = 1;
      try {
         while (true) {
            let res = await APIs.get(endPoints['bulletins'], { params: { page: i } });
            if (res.status === statusCode.HTTP_200_OK) {
               bulletinsArray = [...bulletinsArray, ...res.data.results];
               i++;
            }
            if (res.data.next === null) break;
         }
         setBulletins(bulletinsArray);
      } catch (error) {
         console.error(error);
      }
   };

   useEffect(() => {
      loadBulletins();
   }, []);

   const loadFaculties = async () => {
      try {
         let facultyArray = [];
         let i = 1;
         while (true) {
            let res = await APIs.get(endPoints['faculty'], { params: { page: i } });
            if (res.status === statusCode.HTTP_200_OK) {
               facultyArray = [...facultyArray, ...res.data.results];
               i++;
            }
            if (res.data.next === null) break;
         }
         setFaculties(facultyArray);
      } catch (error) {
         console.error(error);
      }
   };

   useEffect(() => {
      loadFaculties();
   }, []);

   const loadSemester = async () => {
      try {
         let semesterArray = [];
         let i = 1;
         while (true) {
            let res = await APIs.get(endPoints['semesters'], { params: { page: i } });
            if (res.status === statusCode.HTTP_200_OK) {
               semesterArray = [...semesterArray, ...res.data.results];
               i++;
            }
            if (res.data.next === null) break;
         }
         setSemesters(semesterArray);
      } catch (error) {
         console.error(error);
      }
   };

   useEffect(() => {
      loadSemester();
   }, []);

   const handleSelection = async (requestPermission, launchFunction) => {
      let { status } = await requestPermission();
      if (status !== 'granted') {
         Alert.alert('Thông báo', 'Không có quyền truy cập!');
      } else {
         let res = await launchFunction({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
         });

         console.log(res);

         if (!res.canceled) {
            setSelectedImage(res.assets[0].uri)
         }
      }
   };

   const handleGallerySelection = () =>
      handleSelection(ImagePicker.requestMediaLibraryPermissionsAsync, ImagePicker.launchImageLibraryAsync);

   const createActivity = async () => {
      let form = new FormData();
      form.append('name', nameActivity);
      form.append('participant', participant);
      form.append('start_date', formatDate(startDate));
      form.append('end_date', formatDate(endDate));
      form.append('location', location);
      form.append('point', point);
      form.append('bulletin', dropdownBulletin);
      form.append('faculty', dropdownFaculty);
      form.append('semester', dropdownSemester);
      form.append('criterion', dropdownCriterion);
      form.append('image', selectedImage);
     
      form.append('organizational_form', dropdownOrganizer);
      form.append('description', description);

      console.log(form);

      try {
         const accessToken = await AsyncStorage.getItem('access-token');
         let res = await authAPI(accessToken).post(endPoints['activities'], form, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         });

         if (res.status === statusCode.HTTP_201_CREATED) {
            Alert.alert('Thành công', 'Tạo hoạt động thành công');
         } else {
            Alert.alert('Thất bại', 'Không thể tạo hoạt động');
         }
      } catch (error) {
         console.error(error);
         Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo hoạt động');
      }
   };

   return (
      <View style={GlobalStyle.BackGround}>
         <ScrollView
            style={All.AcvitityFormContainer}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
         >
            <View style={All.TextInputContainer}>
               <Text style={All.TextInputTitle}>Hoạt động</Text>
               <View style={All.TextInputWrapper}>
                  <TextInput
                     placeholder="Tên hoạt động"
                     style={All.TextInput}
                     multiline={true}
                     value={nameActivity}
                     onChangeText={setNameActivity}
                  />
                  <Entypo name="news" size={24} color="black" style={All.TextInputIcon} />
               </View>
            </View>

            <View style={All.TextInputFlex}>
               <View style={[All.TextInputContainer, All.Flex]}>
                  <Text style={All.TextInputTitle}>Đối tượng</Text>
                  <View style={All.TextInputWrapper}>
                     <TextInput
                        placeholder="Đối tượng"
                        style={All.TextInput}
                        multiline={true}
                        value={participant}
                        onChangeText={setParticipant}
                     />
                     <Ionicons name="people" size={24} style={All.TextInputIcon} />
                  </View>
               </View>

               <View style={[All.TextInputContainer, All.Flex]}>
                  <Text style={All.TextInputTitle}>Hình thức</Text>
                  <View style={All.TextInputWrapper}>
                     <View style={All.PickerWrapper}>
                        <Picker
                           selectedValue={dropdownOrganizer}
                           style={All.Picker}
                           onValueChange={(itemValue) => setDropDownOrganizer(itemValue)}
                        >
                           <Picker.Item label="Onl" value="Onl" />
                           <Picker.Item label="Off" value="Off" />
                        </Picker>
                     </View>
                  </View>
               </View>
            </View>

            <View style={[All.TextInputContainer, All.Flex]}>
               <Text style={All.TextInputTitle}>Khoa</Text>
               <View style={All.TextInputWrapper}>
                  <View style={All.PickerWrapper}>
                     <Picker
                        selectedValue={dropdownFaculty}
                        style={All.Picker}
                        onValueChange={(itemValue) => setDropDownFaculty(itemValue)}
                     >
                        {faculties.map((faculty) => (
                           <Picker.Item key={faculty.id} label={faculty.name} value={faculty.id} />
                        ))}
                     </Picker>
                  </View>
               </View>
            </View>

            <View style={[All.TextInputContainer, All.Flex]}>
               <Text style={All.TextInputTitle}>Học kì</Text>
               <View style={All.TextInputWrapper}>
                  <View style={All.PickerWrapper}>
                     <Picker
                        selectedValue={dropdownSemester}
                        style={All.Picker}
                        onValueChange={(itemValue) => setDropDownSemester(itemValue)}
                     >
                        {semesters.map((semester) => (
                           <Picker.Item key={semester.id} label={`${semester.original_name} - ${semester.academic_year}`} value={semester.id} />
                        ))}
                     </Picker>
                  </View>
               </View>
            </View>

            <View style={All.TextInputFlex}>
               <View style={[All.TextInputContainer, All.Flex]}>
                  <Text style={All.TextInputTitle}>Ngày bắt đầu</Text>
                  <TouchableOpacity
                     style={All.TextInputWrapper}
                     onPress={() => setShowStartDatePicker(true)}
                  >
                     <TextInput
                        style={[All.TextInput, All.TextInputDate]}
                        editable={false}
                        value={formatDate(startDate)}
                     />
                     <AntDesign name="clockcircle" size={20} color="black" style={All.TextInputIcon} />
                  </TouchableOpacity>
                  {showStartDatePicker && (
                     <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="spinner"
                        onChange={onChangeStartDate}
                     />
                  )}
               </View>

               <View style={[All.TextInputContainer, All.Flex]}>
                  <Text style={All.TextInputTitle}>Ngày kết thúc</Text>
                  <TouchableOpacity
                     style={All.TextInputWrapper}
                     onPress={() => setShowEndDatePicker(true)}
                  >
                     <TextInput
                        style={[All.TextInput, All.TextInputDate]}
                        editable={false}
                        value={formatDate(endDate)}
                     />
                     <AntDesign name="clockcircle" size={20} color="black" style={All.TextInputIcon} />
                  </TouchableOpacity>
                  {showEndDatePicker && (
                     <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="spinner"
                        onChange={onChangeEndDate}
                     />
                  )}
               </View>
            </View>

            <View style={All.TextInputContainer}>
               <Text style={All.TextInputTitle}>Địa điểm</Text>
               <View style={All.TextInputWrapper}>
                  <TextInput
                     placeholder="Địa điểm cụ thể"
                     style={All.TextInput}
                     multiline={true}
                     value={location}
                     onChangeText={setLocation}
                  />
                  <Ionicons name="location" size={24} style={All.TextInputIcon} />
               </View>
            </View>

            <View style={All.TextInputFlex}>
               <View style={[All.TextInputContainer, All.Flex]}>
                  <Text style={All.TextInputTitle}>Điểm</Text>
                  <View style={All.TextInputWrapper}>
                     <TextInput
                        placeholder="Điểm cộng"
                        style={All.TextInput}
                        multiline={true}
                        value={point}
                        onChangeText={setPoint}
                     />
                     <AntDesign name="star" size={24} style={All.TextInputIcon} />
                  </View>
               </View>

               <View style={[All.TextInputContainer, All.Flex]}>
                  <Text style={All.TextInputTitle}>Điều</Text>
                  <View style={All.TextInputWrapper}>
                     <View style={All.PickerWrapper}>
                        <Picker
                           selectedValue={dropdownCriterion}
                           style={All.Picker}
                           onValueChange={(itemValue) => setDropDownCriterion(itemValue)}
                        >
                           {criterions.map((criterion) => (
                              <Picker.Item key={criterion.id} label={criterion.name} value={criterion.id} />
                           ))}
                        </Picker>
                     </View>
                  </View>
               </View>
            </View>

            <View style={[All.TextInputContainer, All.Flex]}>
               <Text style={All.TextInputTitle}>Bản tin</Text>
               <View style={All.TextInputWrapper}>
                  <View style={All.PickerWrapper}>
                     <Picker
                        selectedValue={dropdownBulletin}
                        style={All.Picker}
                        onValueChange={(itemValue) => setDropDownBulletin(itemValue)}
                     >
                        {bulletins.map((bulletin) => (
                           <Picker.Item key={bulletin.id} label={bulletin.name} value={bulletin.id} />
                        ))}
                     </Picker>
                  </View>
               </View>
            </View>

            <View style={All.TextInputContainer}>
               <Text style={All.TextInputTitle}>Hình ảnh</Text>
               <TouchableOpacity style={All.ImageContainer} onPress={handleGallerySelection}>
                  {isLoadingImage ? (
                     <Loading />
                  ) : selectedImage ? (
                     <Image source={{ uri: selectedImage }} style={All.Image} />
                  ) : (
                     <Ionicons name="image-outline" size={24} color="black" />
                  )}
               </TouchableOpacity>
            </View>

            <View style={All.TextInputContainer}>
               <Text style={All.TextInputTitle}>Mô tả</Text>
               <RichToolbar
                  editor={richText}
                  selectedIconTint="#873c1e"
                  iconTint="#312921"
                  style={All.RichEditorToolbar}
                  actions={[
                     actions.setBold,
                     actions.setItalic,
                     actions.setUnderline,
                     actions.insertBulletsList,
                     actions.insertOrderedList,
                     actions.insertLink,
                     actions.setStrikethrough,
                  ]}
               />
               <View style={All.RichEditor}>
                  <RichEditor
                     ref={richText}
                     style={All.TextInput}
                     multiline={true}
                     placeholder="Mô tả hoạt động"
                     androidHardwareAccelerationDisabled={true}
                     onChange={setDescription}
                     showsVerticalScrollIndicator={false}
                     showsHorizontalScrollIndicator={false}
                  />
               </View>

               <View style={All.ButtonContainer}>
                  <TouchableOpacity style={All.Button} onPress={createActivity}>
                     <Text style={All.ButtonText}>Tạo</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </ScrollView>
      </View>
   );
};

export default CreateActivityForm;