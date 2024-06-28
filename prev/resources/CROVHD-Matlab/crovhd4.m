function varargout = crovhd4(varargin)
% CROVHD4 M-file for crovhd4.fig
%      CROVHD4, by itself, creates a new CROVHD4 or raises the existing
%      singleton*.
%
%      H = CROVHD4 returns the handle to a new CROVHD4 or the handle to
%      the existing singleton*.
%
%      CROVHD4('CALLBACK',hObject,eventData,handles,...) calls the local
%      function named CALLBACK in CROVHD4.M with the given input arguments.
%
%      CROVHD4('Property','Value',...) creates a new CROVHD4 or raises the
%      existing singleton*.  Starting from the left, property value pairs are
%      applied to the GUI before crovhd4_OpeningFcn gets called.  An
%      unrecognized property name or invalid value makes property application
%      stop.  All inputs are passed to crovhd4_OpeningFcn via varargin.
%
%      *See GUI Options on GUIDE's Tools menu.  Choose "GUI allows only one
%      instance to run (singleton)".
%
% See also: GUIDE, GUIDATA, GUIHANDLES

% Edit the above text to modify the response to help crovhd4

% Last Modified by GUIDE v2.5 07-Jul-2011 12:12:08

% Begin initialization code - DO NOT EDIT
gui_Singleton = 1;
gui_State = struct('gui_Name',       mfilename, ...
                   'gui_Singleton',  gui_Singleton, ...
                   'gui_OpeningFcn', @crovhd4_OpeningFcn, ...
                   'gui_OutputFcn',  @crovhd4_OutputFcn, ...
                   'gui_LayoutFcn',  [] , ...
                   'gui_Callback',   []);
if nargin && ischar(varargin{1})
    gui_State.gui_Callback = str2func(varargin{1});
end

if nargout
    [varargout{1:nargout}] = gui_mainfcn(gui_State, varargin{:});
else
    gui_mainfcn(gui_State, varargin{:});
end
% End initialization code - DO NOT EDIT


% --- Executes just before crovhd4 is made visible.
function crovhd4_OpeningFcn(hObject, eventdata, handles, varargin)
% This function has no output args, see OutputFcn.
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)
% varargin   command line arguments to crovhd4 (see VARARGIN)

% Choose default command line output for crovhd4
handles.output = hObject;

% Update handles structure
guidata(hObject, handles);

% UIWAIT makes crovhd4 wait for user response (see UIRESUME)
% uiwait(handles.figure1);


% --- Outputs from this function are returned to the command line.
function varargout = crovhd4_OutputFcn(hObject, eventdata, handles) 
% varargout  cell array for returning output args (see VARARGOUT);
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)

% Get default command line output from handles structure
varargout{1} = handles.output;



function tracker_togglebutton_Callback(hObject, eventdata, handles)
% Activates and deactivates mouse tracking
button_state = get(hObject,'Value');
if button_state == get(hObject,'Max')
    var11=1;
    %mouseTracker(handles.distribution,0.5,handles.plotFlag,handles.baseAxes,var11);
    mouseTracker(handles.distribution,0.5,handles,var11);
elseif button_state == get(hObject,'Min')
    % Sets back te previous fuctions
    set(gcf, 'windowbuttonmotionfcn', handles.currFcn);
    set(gcf, 'windowbuttondownfcn', handles.currFcn2);
    set(gcf,'Pointer','arrow');
    title(handles.currTitle);
    uirestore(handles.theState);
    handles.ID=0;
    guidata(gca,handles);
    cla reset;
    readData;
    handles.distribution=distribution;
    guidata(hObject,handles);
end


function densityPlot_togglebutton_Callback(hObject, eventdata, handles)
button_state = get(hObject,'Value');
if button_state == get(hObject,'Max')
   handles.plotFlag=1;
elseif button_state == get(hObject,'Min')
   handles.plotFlag=0;
end
guidata(hObject,handles);
reset_pushbutton_Callback(handles.reset_pushbutton,[],handles);


function zoom_togglebutton_Callback(hObject, eventdata, handles)
button_state = get(hObject,'Value');
if button_state == get(hObject,'Max')
   zoom on;
elseif button_state == get(hObject,'Min')
  zoom off;
end


function reset_pushbutton_Callback(hObject, eventdata, handles)
cla reset;
set(handles.edit1,'String',''); 
handles.bitstr=0;
readData;
handles.distribution=distribution;
guidata(hObject,handles);



% --- Executes on button press in showLegend_pushbutton.
function showLegend_pushbutton_Callback(hObject, eventdata, handles)
% hObject    handle to showLegend_pushbutton (see GCBO)
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)
hold off;

cd=legend(handles.colorDist)
handles.colorDist=cd;

reset_pushbutton_Callback(handles.reset_pushbutton,[],handles);
hold on;



function edit1_Callback(hObject, eventdata, handles)
cla reset;
qnum=bin2dec((get(hObject,'String')))+1;
handles.qnum=qnum;
handles.bitstr=1;
guidata(hObject,handles);
zoomBitString(handles,0.5);



% --- Executes during object creation, after setting all properties.
function edit1_CreateFcn(hObject, eventdata, handles)
% hObject    handle to edit1 (see GCBO)
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    empty - handles not created until after all CreateFcns called

% Hint: edit controls usually have a white background on Windows.
%       See ISPC and COMPUTER.
if ispc && isequal(get(hObject,'BackgroundColor'), get(0,'defaultUicontrolBackgroundColor'))
    set(hObject,'BackgroundColor','white');
end


% --- Executes on selection change in baseAxes_popupmenu.
function baseAxes_popupmenu_Callback(hObject, eventdata, handles)
handles.baseAxes=get(hObject,'Value');
guidata(hObject,handles);
if handles.bitstr
    cla reset
    zoomBitString(handles,0.5);
else
    densityPlot_togglebutton_Callback(handles.densityPlot_togglebutton,[],handles);
end



% --- Executes during object creation, after setting all properties.
function baseAxes_popupmenu_CreateFcn(hObject, eventdata, handles)
% Hint: popupmenu controls usually have a white background on Windows.
%       See ISPC and COMPUTER.
if ispc && isequal(get(hObject,'BackgroundColor'), get(0,'defaultUicontrolBackgroundColor'))
    set(hObject,'BackgroundColor','white');
end


% --------------------------------------------------------------------
function fileMenu_Callback(hObject, eventdata, handles)
% To enable save option in menu only when a plot is present
if isempty(get(handles.axes1,'Children'))
    set(handles.saveItem,'Enable','off')
else
    set(handles.saveItem,'Enable','on')
end


% --------------------------------------------------------------------
function openItem_Callback(hObject, eventdata, handles) % To open data files to draw plots
handles.filename =uigetfile;
set(handles.densityPlot_togglebutton,'Value',1);
handles.plotFlag=1;                                     % density=1 or scatter=0 
handles.baseAxes=1;                                     % base axis for which scatter plot is drawn
handles.bitstr=0;
readData;
for i=1:handles.dimensions
    base(i,1)=num2str(i);
end
set(handles.baseAxes_popupmenu,'String',base);
set(handles.baseAxes_popupmenu,'Value',1);
handles.distribution=distribution;

guidata(hObject,handles);


% --------------------------------------------------------------------
function saveItem_Callback(hObject, eventdata, handles)
% To save plots
[f, p, filterindex] = uiputfile( ...
{
 '*.fig','Figures (*.fig)';...
 '*.jpg','JPEG Image(*.jpg)'
 '*.png','PNG Image (*.png)'},...
 'Save');
C=textscan(f, '%s %s', 'delimiter', '.');
newFig=figure;
axesObject2=copyobj(handles.axes1,newFig);
str=C{2};
if str{1}=='jpg' , str{1}='jpeg'; end
print(newFig,strcat('-d',str{1}),[p f]);
close(newFig);


% --------------------------------------------------------------------
function closeItem_Callback(hObject, eventdata, handles)
close
