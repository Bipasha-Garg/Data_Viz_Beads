% readData.m
% Reads and stores the data
%*************************************************************************
fid=fopen(handles.filename);
tline = fgetl(fid);
i=1;
while(length(tline))
    C=textscan(tline, '%f %f %f %f %s', 'delimiter', ',', 'EmptyValue', 0);
    points(i,:)=double([C{1:4}]);
    i=i+1;
    tline = fgetl(fid);
end
handles.dimensions=4;
handles.colorDist=defaultColorDist(points,0.5);
distribution=ndimenl(4,points,0.5,5,0,handles);
fclose(fid);
%**************************************************************************