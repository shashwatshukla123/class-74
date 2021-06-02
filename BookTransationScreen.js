import React, { Component } from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image,TextInput,KeyboardAvoidingView,ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../config';

export default class BookTransationScreen extends React.Component{
    constructor(){
        super()
        this.state={
            hasCameraPermission:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
            scannedBookID:'',
            scannedStudentID:''
        }
    }
    
    getCameraPermisssion=async(ID)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
        hasCameraPermission:status=='granted',
        buttonState:ID,
        scanned:false
    })
    }

    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState=='BookID'){
    this.setState({
        scanned:true,
        scannedData:data,
        buttonState:'normal'
    })
}
 else if(buttonState=='StudentID'){
    this.setState({
        scanned:true,
        scannedData:data,
        buttonState:'normal'
    })
}

    }
    initiateBookIssue=async()=>{
        db.collection('transaction').add({
            'studentID':this.state.scannedStudentID,
            'bookID':this.state.scannedBookID,
            'data':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':'issue',
        })
        db.collection('books').doc(this.state.scannedBookID).update({
            'bookavailability':false
        })
        db.collection('student').doc(this.state.scannedStudentID).update({
            'numberofbooksissued':firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedBookID:'',
            scannedstudentID:'',
        })
    }

    initiateBookReturn=()=>{
    db.collection('transaction').add({
        'studentID':this.state.scannedStudentID,
        'bookID':this.state.scannedBookID,
        'data':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':'return'
    })
    db.collection('books').doc(this.states.scannedBookID).update({
        'bookavailability':true
    })
    db.collection('students').doc(this.state.scannedStudentID).update({
        'numberofbooksissued':firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
        scannedBookID:'',
        scannedstudentID:'',
    })
    }

    handleTransaction=async()=>{
        var transactionType=await this.checkBookEligibility()
            if(!transactionType){
                Alert.alert('the book doesnot exist in database')
                this.setState({
                    scannedStudentID:'',
                    scannedBookID:'',
                })
            }
         else if(transactionType=='issue'){
             var isStudentEligible=await this.checkStudentEligibilityForBookIssue()
                 if(isStudentEligible){
                     this.initiateBookIssue()
                     Alert.alert('book issued to the student')
                 }
             }
             else{
                var isStudentEligible=await this.checkStudentEligibilityForBookReturned()
                   if(isStudentEligible){
                       this.initiateBookReturn()
                       Alert.alert('book has been returned')
                   }
                
             }
         }
       

   checkStudentEligibilityForBookIssue=async()=>{
       const studentRef=await db.collection('students').where('studentID','==',this.state.scannedStudentID).get()
       var isStudentEligible=''
       if(studentRef.docs.length==0){
           this.setState({
               scannedstudentID:'',
               scannedBookID:'',
           })
           isStudentEligible=false
           Alert.alert('the studentID doesnot exist in database')
       }
       else {
           studentRef.docs.map((doc)=>{
               var student=doc.data()
               if(student.numberofbooksissued<2){
                   isStudentEligible=true
               }
               else{
                   isStudentEligible=false
                   Alert.alert('the student has already 2 books')
                   this.setState({
                       scannedStudentID:'',
                       scannedBookID:'',
                   })
               }
           })
       }
       return isStudentEligible
   }
    
   checkStudentEligibilityForBookReturned=async()=>{
   const transactionRef=await db.collection('transaction').where('bookID','==',this.state.scannedBookID).limit(1).get()
   var  isStudentEligible=''
   transactionRef.docs.map((doc)=>{
       var lastBookTransaction=doc.data()
       if(lastBookTransaction.studentID==this.state.scannedStudentID){
           isStudentEligible=true
       }
       else{
           isStudentEligible=false
           Alert.alert("the book wasn't issued by this student")
           this.setState({
               scannedstudentID:'',
               scannedBookID:'',
           })
       }
   })
    return isStudentEligible
   }

   checkBookEligibility=async()=>{
       const BookRef=await db.collection('books').where('bookID','==',this.state.scannedBookID).get()
       var transactionType ="";
       if(BookRef.docs.length==0){
           transactionType = false ;
       }
       else{
           BookRef.docs.map((doc)=>{
               var book=doc.data()
               if(book.bookavailability){
                   transactionType='issue';
               }else{
                   transactionType='return';
               }
           })
           return transactionType
       }
   }

    render(){
        const hasCameraPermission=this.state.hasCameraPermission
        const scanned=this.state.scanned
        const buttonState=this.state.buttonState
        if(buttonState!=='normal'&&hasCameraPermission){
            return(
                <BarCodeScanner
                onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}/>
            )
        }
        else if(buttonState=='normal'){

        
        return(
            <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
            <View>
            <Image
            source={require('../assets/booklogo.jpg')}
            style={{width:200,height:200}}/>
            <Text style={{textAlign:'center',fontSize:30}}> WILY</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput
            style={styles.inputBox}
            placeholder='BookID'
            onChangeText={text=>this.setState({scannedBookID:text})}
            value={this.state.scannedBookID}
            />
            <TouchableOpacity style={styles.scannedButton}
                onPress={()=>{
                    this.getCameraPermisssion('BookID')
                }}>
                <Text style={styles.buttonText}>Scan</Text>    
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput
            style={styles.inputBox}
            placeholder='StudentID'
            onChangeText={text=>this.setState({scannedstudentID:text})}
            value={this.state.scannedstudentID}
            />
            <TouchableOpacity style={styles.scannedButton}
                onPress={()=>{
                    this.getCameraPermisssion('StudentID')
                }}>
                <Text style={styles.buttonText}>Scan</Text>    
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sumitButton}
            onPress={async()=>{this.handleTransaction()
            this.setState({
                scannedBookID:'',
                scannedStudentID:''
            })}}>
                <Text style={styles.sumitButtonText}>Submit</Text>
            </TouchableOpacity>
            </KeyboardAvoidingView>

        )
    }
}
}

const styles= StyleSheet.create({
    scanButton:{
        backgroundColor:'red',
        padding:10,
        margin:10
    },
    buttonText:{
        fontSize:20,
        textAlign:'center',
        marginTop:10
    },
    inputView:{
    flexDirection:'row',
    margin:20        
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    scannedButton:{
        backgroundColor:'blue',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0
    },
    sumitButton:{
        backgroundColor:'green',
        width:100,
        height:50
    },
    sumitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'white'
    }
})

