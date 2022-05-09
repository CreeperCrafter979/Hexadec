// PagePag>(Instruction Pointer)ePage.Palette.Disabled Instructions_Default Register
const levels = [
    //0123456789ABCDEF"+"0123456789ABCDEF"+"0123456789ABCDEF"+"0123456789ABCDEF"+"0123456789ABCDEF"+"0123456789ABCDEF"+"0123456789ABCDEF"+"0123456789ABCDEF
    ">15203145546476d2"+"9c2ac5bc1470d180"+"cb4fcb1f860f80e1.4622BC3.0CA"          // Functionality tester
];

let cur = {
    levelIndex: 0,
    pages: "",
    dimmed: "",
    palette: "",
    disabledInstructions: "",
    instructionPointer: 0,
    register: 0,
    vFlag: false,
    get instructionRegister() {return this.pages[this.instructionPointer]},
    get pagesIndexFromIR() {return parseInt(this.instructionRegister, 16) - this.instructionPointer % 16 + this.instructionPointer}
};

function ParseLevel(levelCode) {
    const levelData = levelCode.split(".");

    cur.pages = levelData[0].replace(">", "");
    cur.dimmed = levelData[0].replace(">", "");
    cur.palette = levelData[1];
    cur.disabledInstructions = levelData[2].slice(0, -1);
    cur.instructionPointer = levelData[0].indexOf(">");
    cur.register = levelData[2].at(-1);

    // Oh gosh my eyes, oh well this will do for now
    cur.pages = cur.pages.replaceAll(")", "0").replaceAll("!", "1").replaceAll("@", "2").replaceAll("#", "3").replaceAll("$", "4").replaceAll("%", "5").replaceAll("^", "6").replaceAll("&", "7").replaceAll("*", "8").replaceAll("(", "9").replaceAll("a", "A").replaceAll("b", "B").replaceAll("c", "C").replaceAll("d", "D").replaceAll("e", "E").replaceAll("f", "F");
    cur.dimmed = cur.dimmed.replaceAll("0", "0").replaceAll("1", "0").replaceAll("2", "0").replaceAll("3", "0").replaceAll("4", "0").replaceAll("5", "0").replaceAll("6", "0").replaceAll("7", "0").replaceAll("8", "0").replaceAll("9", "0").replaceAll("a", "0").replaceAll("b", "0").replaceAll("c", "0").replaceAll("d", "0").replaceAll("e", "0").replaceAll("f", "0");
    cur.dimmed = cur.dimmed.replaceAll(")", "1").replaceAll("!", "1").replaceAll("@", "1").replaceAll("#", "1").replaceAll("$", "1").replaceAll("%", "1").replaceAll("^", "1").replaceAll("&", "1").replaceAll("*", "1").replaceAll("(", "1").replaceAll("A", "1").replaceAll("B", "1").replaceAll("C", "1").replaceAll("D", "1").replaceAll("E", "1").replaceAll("F", "1");
}

ParseLevel(levels[0]);

function Cycle() {
    // Decode the current instruction
    switch(cur.instructionRegister) {
        case "0": // NOP (No operation)
            IncrementIP();
            break;
        case "1": // LDI (Load into register immidiate)
            IncrementIP();
            cur.register = cur.instructionRegister;
            IncrementIP();
            break;
        case "2": // LDA (Load into register absolute)
            IncrementIP();
            cur.register = cur.pages[cur.pagesIndexFromIR];
            IncrementIP();
            break;
        case "3": // STA (Store from register absolute)
            IncrementIP();
            cur.pages = cur.pages.slice(0, cur.pagesIndexFromIR) + cur.register + cur.pages.slice(cur.pagesIndexFromIR + 1);
            IncrementIP();
            break;
        case "4": // ADI (Add immidiate)
            IncrementIP();
            cur.vFlag = parseInt(cur.register, 16) + parseInt(cur.instructionRegister, 16) >= 16;
            cur.register = ((parseInt(cur.register, 16) + parseInt(cur.instructionRegister, 16)) % 16).toString(16).toUpperCase();
            IncrementIP();
            break;
        case "5": // ADA (Add absolute)
            IncrementIP();
            cur.vFlag = parseInt(cur.register, 16) + parseInt(cur.pages[cur.pagesIndexFromIR], 16) >= 16;
            cur.register = ((parseInt(cur.register, 16) + parseInt(cur.pages[cur.pagesIndexFromIR], 16)) % 16).toString(16).toUpperCase();
            IncrementIP();
            break;
        case "6": // SBI (Subtract immidiate)
            IncrementIP(); // Negative inclusive wrap: x - 16 * Math.floor(x / 16)
            cur.vFlag = parseInt(cur.register, 16) - parseInt(cur.instructionRegister, 16) < 0;
            cur.register = ((parseInt(cur.register, 16) - parseInt(cur.instructionRegister, 16)) - 16 * Math.floor((parseInt(cur.register, 16) - parseInt(cur.instructionRegister, 16)) / 16)).toString(16).toUpperCase();
            IncrementIP();
            break;
        case "7": // SBA (Subtract absolute)
            IncrementIP(); // Negative inclusive wrap: x - 16 * Math.floor(x / 16)
            cur.vFlag = parseInt(cur.register, 16) - parseInt(cur.pages[cur.pagesIndexFromIR], 16) < 0;
            cur.register = parseInt(cur.register, 16) - parseInt(cur.pages[cur.pagesIndexFromIR], 16);
            cur.register = (cur.register - 16 * Math.floor(cur.register / 16)).toString(16).toUpperCase();
            IncrementIP();
            break;
        case "8": // JMP (Jump)
            IncrementIP();
            cur.instructionPointer = cur.pagesIndexFromIR;
            break;
        case "9": // JPE (Jump if equal)
            IncrementIP();
            var tmpDest = cur.pagesIndexFromIR;
            IncrementIP();
            if(parseInt(cur.register, 16) == parseInt(cur.instructionRegister, 16)) cur.instructionPointer = tmpDest;
            else IncrementIP();
            break;
        case "A": // JPG (Jump if greater than)
            IncrementIP();
            var tmpDest = cur.pagesIndexFromIR;
            IncrementIP();
            if(parseInt(cur.register, 16) > parseInt(cur.instructionRegister, 16)) cur.instructionPointer = tmpDest;
            else IncrementIP();
            break;
        case "B": // JPL (Jump if less than)
            IncrementIP();
            var tmpDest = cur.pagesIndexFromIR;
            IncrementIP();
            if(parseInt(cur.register, 16) < parseInt(cur.instructionRegister, 16)) cur.instructionPointer = tmpDest;
            else IncrementIP();
            break;
        case "C": // JPO (Jump if over/underflow)
            IncrementIP();
            if(cur.vFlag) cur.instructionPointer = cur.pagesIndexFromIR;
            else IncrementIP();
            break;
        case "D": // PGU (Page up)
            var tmpPrev = cur.instructionPointer; // And yes this var is intentional, REDECLARATION IS USEFUL
            IncrementIP();
            cur.instructionPointer = tmpPrev + 16 * parseInt(cur.instructionRegister, 16);
            cur.instructionPointer = cur.instructionPointer - cur.pages.length * Math.floor(cur.instructionPointer / cur.pages.length);
            break;
        case "E": // PGD (Page down)
            var tmpPrev = cur.instructionPointer;
            IncrementIP();
            cur.instructionPointer = tmpPrev - 16 * parseInt(cur.instructionRegister, 16);
            cur.instructionPointer = cur.instructionPointer - cur.pages.length * Math.floor(cur.instructionPointer / cur.pages.length);
            break;
        case "F": // HLT (Halt)
            alert("Program Halted");
            break;
    }

    // Console testing
    return [cur.pages.slice(0, cur.instructionPointer) + ">" + cur.pages.slice(cur.instructionPointer),
        ["NOP", "LDI", "LDA", "STA", "ADI", "ADA", "SBI", "SBA", "JMP", "JPE", "JPG", "JPL", "JPO", "PGU", "PGD", "HLT"][parseInt(cur.instructionRegister, 16)], cur.register, cur.instructionPointer, 
        Math.floor(cur.instructionPointer / 16), (cur.instructionPointer % 16).toString(16).toUpperCase()];
}

function IncrementIP() {
    cur.instructionPointer++;
    if(cur.instructionPointer % 16 == 0) cur.instructionPointer -= 16; // Wrap within page
}