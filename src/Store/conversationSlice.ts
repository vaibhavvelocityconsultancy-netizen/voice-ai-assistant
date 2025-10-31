import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface ConversationState {
  message: Message[];
  isListening: boolean;
}

const initialState: ConversationState = {
  message: [],
  isListening: false,
};


const ConversationState = createSlice({
    name: "conversation",
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Message>) => {
            state.message.push(action.payload);
        },
        toggleListening: (state, action: PayloadAction<boolean>) => {
            state.isListening = action.payload;
        },
    },
})

export const {addMessage, toggleListening} = ConversationState.actions;

export default ConversationState.reducer;